import { describe, expect, it } from 'vitest'

import {
  imageIndex,
  legacyMirror,
  legacyPictureAddress,
  mediaSource,
  rowImageSource,
} from '@/lib/media'

/**
 * The two decisions behind drawing a Media document (issue #101): which address resolves, and
 * which photo a gallery opens on.
 */
describe('mediaSource', () => {
  const upload = {
    url: '/api/media/file/seed-gold.png',
    alt: 'Gold placeholder',
    width: 1280,
    height: 720,
  }

  it('draws the upload when that is all the document has', () => {
    expect(mediaSource(upload)).toEqual({
      src: '/api/media/file/seed-gold.png',
      alt: 'Gold placeholder',
      width: 1280,
      height: 720,
    })
  })

  it('takes this site off the front of its own upload', () => {
    // Payload builds the URL from `serverURL`, and `next/image` refuses a host that is not in
    // `remotePatterns` — which this site's own host cannot be, since it differs per environment.
    const absolute = { ...upload, url: 'https://atmjet.com/api/media/file/seed-gold.png' }

    expect(mediaSource(absolute, 'https://atmjet.com')?.src).toBe('/api/media/file/seed-gold.png')
  })

  it("leaves another site's URL whole", () => {
    const elsewhere = { ...upload, url: 'https://cdn.example/aircraft/1.jpg' }

    expect(mediaSource(elsewhere, 'https://atmjet.com')?.src).toBe(
      'https://cdn.example/aircraft/1.jpg',
    )
  })

  it('prefers the legacy host while the file still lives there', () => {
    // The media migration imports the rows before it mirrors the files (E5.12), so for a while
    // the only address that resolves is the old one.
    const migrating = { ...upload, externalUrl: 'https://legacy.example/aircraft/1.jpg' }

    expect(mediaSource(migrating)?.src).toBe('https://legacy.example/aircraft/1.jpg')
  })

  it('draws a picture of the Space from its mirrored copy, under the path the Space gave it', () => {
    // The mirror of #21 holds every object at `legacy/<its decoded path>`, whichever host the
    // row spelt the Space with; the path keeps the encoding a browser needs.
    const mirror = 'https://bucket.example'
    const cdn = {
      ...upload,
      externalUrl: 'https://atmjet.ams3.cdn.digitaloceanspaces.com/Yachts%20ATM%20JET/a.jpg',
    }
    const bare = {
      ...upload,
      externalUrl: 'https://atmjet.ams3.digitaloceanspaces.com/image_1.jpg',
    }

    expect(mediaSource(cdn, 'https://atmjet.com', mirror)?.src).toBe(
      'https://bucket.example/legacy/Yachts%20ATM%20JET/a.jpg',
    )
    expect(mediaSource(bare, 'https://atmjet.com', mirror)?.src).toBe(
      'https://bucket.example/legacy/image_1.jpg',
    )
  })

  it('asks the Space itself, through its CDN, where there is no bucket to mirror into', () => {
    // A workstation without the S3 group has no mirror; the CDN host is the one
    // `next.config.ts` allows, the bare one is not.
    const bare = {
      ...upload,
      externalUrl: 'https://atmjet.ams3.digitaloceanspaces.com/image_1.jpg',
    }

    expect(mediaSource(bare, 'https://atmjet.com', null)?.src).toBe(
      'https://atmjet.ams3.cdn.digitaloceanspaces.com/image_1.jpg',
    )
  })

  it('ignores an external URL that holds nothing but spaces', () => {
    expect(mediaSource({ ...upload, externalUrl: '   ' })?.src).toBe(upload.url)
  })

  it('has nothing to draw for a document that names no file', () => {
    expect(mediaSource({ alt: 'Described but absent' })).toBeNull()
    expect(mediaSource(null)).toBeNull()
    expect(mediaSource(undefined)).toBeNull()
  })

  it('leaves out a size the document does not carry rather than guessing one', () => {
    const source = mediaSource({ url: '/api/media/file/a.png', alt: 'A' })

    expect(source).toEqual({ src: '/api/media/file/a.png', alt: 'A' })
  })
})

describe('imageIndex', () => {
  it('opens on the photo it is asked for', () => {
    expect(imageIndex(1, 4)).toBe(1)
    expect(imageIndex(0, 4)).toBe(0)
    expect(imageIndex(3, 4)).toBe(3)
  })

  it('opens on the last photo rather than past it', () => {
    // The legacy yacht page asked for the second photo of a gallery that had one, and rendered
    // `<Image src={undefined}>` (section 13, entry 45).
    expect(imageIndex(1, 1)).toBe(0)
    expect(imageIndex(9, 4)).toBe(3)
  })

  it('opens on the first photo rather than before it', () => {
    expect(imageIndex(-2, 4)).toBe(0)
  })

  it('has an answer for a gallery with no photos at all', () => {
    expect(imageIndex(1, 0)).toBe(0)
  })
})

describe('legacyPictureAddress', () => {
  it('leaves an address off the Space alone, over https', () => {
    expect(
      legacyPictureAddress(
        'https://atmjet.s3.eu-north-1.amazonaws.com/aircrafts/a/images/cabin-0.jpeg',
        'https://m.example',
      ),
    ).toBe('https://atmjet.s3.eu-north-1.amazonaws.com/aircrafts/a/images/cabin-0.jpeg')
    // The legacy detail page asked for vehicle pictures over `http://` (section 13, entry 35).
    expect(legacyPictureAddress('http://cdn.example/a.jpg', null)).toBe('https://cdn.example/a.jpg')
  })

  it('is the row itself when the row is not an address', () => {
    expect(legacyPictureAddress('not an address', 'https://m.example')).toBe('not an address')
  })
})

describe('legacyMirror', () => {
  it('is the public address of the bucket, or the bucket itself, or nothing', () => {
    const bucket = { bucket: 'b', region: 'r', accessKeyId: 'k', secretAccessKey: 's' }

    expect(legacyMirror({ ...bucket, publicUrl: 'https://cdn.example' })).toBe(
      'https://cdn.example',
    )
    expect(legacyMirror(bucket)).toBe('https://b.s3.r.amazonaws.com')
    expect(legacyMirror(null)).toBeNull()
  })
})

describe('rowImageSource', () => {
  const upload = { url: '/api/media/file/a.png', alt: 'From the upload', width: 10, height: 5 }

  it('lets what the row says win over the upload it points at', () => {
    expect(
      rowImageSource(
        { media: upload, externalUrl: 'https://cdn.example/row.jpg', alt: 'From the row' },
        'https://atmjet.com',
        null,
      ),
    ).toEqual({ src: 'https://cdn.example/row.jpg', alt: 'From the row', width: 10, height: 5 })
  })

  it('draws the upload when the row adds nothing, and nothing when there is no row', () => {
    expect(rowImageSource({ media: upload }, 'https://atmjet.com', null)?.src).toBe(upload.url)
    expect(rowImageSource({ media: 7 }, 'https://atmjet.com', null)).toBeNull()
    expect(rowImageSource(undefined)).toBeNull()
  })
})
