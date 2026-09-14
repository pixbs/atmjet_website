import { describe, expect, it } from 'vitest'

import { imageIndex, mediaSource } from '@/lib/media'

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
