import { describe, expect, it } from 'vitest'

import {
  distinctObjects,
  LEGACY_PDFS,
  manifestTsv,
  mappingOf,
  mirroredUrl,
  normaliseSpacesUrl,
  objectKeyFor,
  reconcile,
  referencesQuery,
  type ManifestEntry,
} from '../../scripts/media/spaces'

/**
 * The Spaces mirror (issue #21, ADR-0002 item 9), away from the Space and the bucket: how a
 * legacy value becomes one address and one key, and how a run knows it is finished.
 */
const CDN = 'https://atmjet.ams3.cdn.digitaloceanspaces.com'

describe('normaliseSpacesUrl', () => {
  it('gives the scheme-less vehicles values the scheme the browser added for them', () => {
    // `vehicles.image` and `vehicles.thumb` hold `host/file` (docs/legacy-inventory.md section 8).
    expect(normaliseSpacesUrl('atmjet.ams3.digitaloceanspaces.com/image_15547.jpg')).toBe(
      'https://atmjet.ams3.digitaloceanspaces.com/image_15547.jpg',
    )
  })

  it('leaves a full address as it is, whichever of the two hosts names the Space', () => {
    expect(normaliseSpacesUrl(`${CDN}/Duke_yacht/Duke_01.jpg`)).toBe(
      `${CDN}/Duke_yacht/Duke_01.jpg`,
    )
    expect(normaliseSpacesUrl(' http://ATMJET.ams3.digitaloceanspaces.com/a.jpg ')).toBe(
      'https://atmjet.ams3.digitaloceanspaces.com/a.jpg',
    )
  })

  it('is nothing for a value that points elsewhere or nowhere', () => {
    expect(normaliseSpacesUrl('https://atmjet.s3.eu-north-1.amazonaws.com/yachts/a.png')).toBeNull()
    expect(normaliseSpacesUrl('')).toBeNull()
    expect(normaliseSpacesUrl(null)).toBeNull()
    expect(normaliseSpacesUrl('not a url at all ::')).toBeNull()
  })
})

describe('objectKeyFor', () => {
  it('mirrors an object under legacy/ at its decoded path, whichever host named it', () => {
    expect(objectKeyFor(`${CDN}/Yachts%20ATM%20JET/Dolce%20Vita/DolceVita_page-0001.jpg`)).toBe(
      'legacy/Yachts ATM JET/Dolce Vita/DolceVita_page-0001.jpg',
    )
    expect(objectKeyFor('https://atmjet.ams3.digitaloceanspaces.com/thumb_15547.jpg')).toBe(
      'legacy/thumb_15547.jpg',
    )
  })

  it('encodes the key back into an address a browser can fetch', () => {
    expect(
      mirroredUrl('https://atmjet.s3.eu-north-1.amazonaws.com/', 'legacy/Yachts ATM JET/a b.jpg'),
    ).toBe('https://atmjet.s3.eu-north-1.amazonaws.com/legacy/Yachts%20ATM%20JET/a%20b.jpg')
  })
})

describe('distinctObjects', () => {
  it('counts an object once however many rows name it, and remembers every row', () => {
    const objects = distinctObjects([
      {
        table: 'vehicles',
        rowId: '1',
        column: 'image',
        value: 'atmjet.ams3.digitaloceanspaces.com/a.jpg',
      },
      { table: 'vehicles', rowId: '2', column: 'image', value: `${CDN}/a.jpg` },
      { table: 'yachts', rowId: '7', column: 'pictures', value: `${CDN}/Duke_yacht/Duke_01.jpg` },
      {
        table: 'new_yachts',
        rowId: '9',
        column: 'photos',
        value: 'https://atmjet.s3.eu-north-1.amazonaws.com/y.png',
      },
    ])

    // The CDN host and the bare host are the same Space, but not the same address; each is
    // listed as the rows wrote it, and the key they map to is what makes them one object.
    expect(objects.get('https://atmjet.ams3.digitaloceanspaces.com/a.jpg')).toEqual([
      'vehicles:1.image',
    ])
    expect(objects.get(`${CDN}/a.jpg`)).toEqual(['vehicles:2.image'])
    expect(objects.get(`${CDN}/Duke_yacht/Duke_01.jpg`)).toEqual(['yachts:7.pictures'])
    expect([...objects.keys()].some((url) => url.includes('amazonaws'))).toBe(false)
  })

  it('always lists the four documents the business-agents page links by hand', () => {
    const objects = distinctObjects([])

    expect(objects.size).toBe(LEGACY_PDFS.length)
    expect(objects.get(LEGACY_PDFS[2])).toEqual(['business_agents:page.pdf'])
  })
})

const entry = (url: string, status: number, key = objectKeyFor(url)): ManifestEntry => ({
  url,
  key,
  status,
  size: status === 200 ? 1234 : null,
  contentType: status === 200 ? 'image/jpeg' : null,
  referencedBy: ['vehicles:1.image'],
})

describe('reconcile', () => {
  it('is finished when the bucket holds every object the Space answered for', () => {
    const manifest = [entry(`${CDN}/a.jpg`, 200), entry(`${CDN}/gone.jpg`, 404)]

    expect(reconcile(manifest, new Set(['legacy/a.jpg']))).toEqual({
      listed: 2,
      answering: 1,
      missing: 1,
      copied: 1,
      uncopied: [],
    })
  })

  it('names what a run still has to copy rather than rounding it away', () => {
    const manifest = [entry(`${CDN}/a.jpg`, 200), entry(`${CDN}/b.jpg`, 200)]

    expect(reconcile(manifest, new Set(['legacy/a.jpg'])).uncopied).toEqual(['legacy/b.jpg'])
  })
})

describe('the files a run writes', () => {
  it('lists the manifest one object per line, sorted, with the rows that point at it', () => {
    const tsv = manifestTsv([entry(`${CDN}/b.jpg`, 200), entry(`${CDN}/a.jpg`, 404)])

    expect(tsv.split('\n')).toEqual([
      'url\tstatus\tsize\tcontent_type\tkey\treferenced_by',
      `${CDN}/a.jpg\t404\t\t\tlegacy/a.jpg\tvehicles:1.image`,
      `${CDN}/b.jpg\t200\t1234\timage/jpeg\tlegacy/b.jpg\tvehicles:1.image`,
      '',
    ])
  })

  it('maps only the objects that exist, to where the bucket serves them', () => {
    const mapping = mappingOf(
      [entry(`${CDN}/a.jpg`, 200), entry(`${CDN}/gone.jpg`, 404)],
      'https://atmjet.s3.eu-north-1.amazonaws.com',
    )

    expect(mapping).toEqual({
      [`${CDN}/a.jpg`]: 'https://atmjet.s3.eu-north-1.amazonaws.com/legacy/a.jpg',
    })
  })
})

describe('referencesQuery', () => {
  it('reads the four legacy columns from the schema it is given', () => {
    const query = referencesQuery('legacy')

    expect(query).toContain('"legacy"."vehicles"')
    expect(query).toContain('unnest(pictures) FROM "legacy"."yachts"')
    expect(query).toContain('unnest(photos) FROM "legacy"."new_yachts"')
  })

  it('refuses anything but a plain schema name into the statement', () => {
    expect(() => referencesQuery('legacy"; drop table')).toThrow(/not a schema name/)
  })
})
