import { describe, expect, it } from 'vitest'

import { detailEntries, pageEntries, type Listable } from '@/lib/sitemap'

/**
 * What `/sitemap.xml` offers a crawler (issue #171). The legacy sitemap was a written list of
 * paths and listed `/citezens`, nothing at `/sales_yachts` and unprefixed URLs that redirect
 * (`docs/legacy-inventory.md` section 2.3); these pin the behaviours that replace it.
 */
const ORIGIN = 'https://atmjet.com'

const PAGES: Listable[] = [
  { slug: '', updatedAt: '2026-09-01T10:00:00.000Z' },
  { slug: 'citizens', updatedAt: '2026-09-02T10:00:00.000Z' },
  { slug: 'sales_yachts', updatedAt: '2026-09-03T10:00:00.000Z' },
]

const urls = (entries: ReturnType<typeof pageEntries>) => entries.map((entry) => entry.url)

describe('pageEntries', () => {
  it('lists the pages the collection holds, so a path nobody created cannot appear', () => {
    // The home page is the locale root, not `/en/home`; the legacy sitemap listed the
    // unprefixed `/` and `/citezens`, neither of which resolves without a redirect.
    expect(urls(pageEntries(ORIGIN, ['en'], PAGES))).toEqual([
      'https://atmjet.com/en',
      'https://atmjet.com/en/citizens',
      'https://atmjet.com/en/sales_yachts',
    ])
  })

  it('prefixes every locale it offers', () => {
    expect(urls(pageEntries(ORIGIN, ['ru'], PAGES))).toContain('https://atmjet.com/ru/citizens')
  })

  it('offers each served locale as an alternate, and x-default for the rest', () => {
    const [home] = pageEntries(ORIGIN, ['en', 'ru'], PAGES)

    expect(home.alternates?.languages).toEqual({
      en: 'https://atmjet.com/en',
      ru: 'https://atmjet.com/ru',
      'x-default': 'https://atmjet.com/en',
    })
  })

  it('says nothing about a language the site does not serve', () => {
    const [home] = pageEntries(ORIGIN, ['en', 'ru'], PAGES)

    expect(Object.keys(home.alternates?.languages ?? {})).not.toContain('uk')
  })

  it('reports when an editor last changed the page, not when the build ran', () => {
    const [, citizens] = pageEntries(ORIGIN, ['en'], PAGES)

    expect(citizens.lastModified).toBe('2026-09-02T10:00:00.000Z')
  })

  it('asks a crawler for the home page first', () => {
    const [home, citizens] = pageEntries(ORIGIN, ['en'], PAGES)

    expect(home.priority).toBeGreaterThan(citizens.priority ?? 0)
  })

  it('leaves out a page an editor has not given a slug yet', () => {
    const entries = pageEntries(ORIGIN, ['en'], [...PAGES, { slug: null, updatedAt: null }])

    expect(entries).toHaveLength(PAGES.length)
  })

  it('offers nothing while the site serves no locale', () => {
    expect(pageEntries(ORIGIN, [], PAGES)).toEqual([])
  })
})

/**
 * A page served in fewer languages than the site (issue #149). The legacy sitemap had no idea
 * the citizens page was Russian only, so it advertised an English URL that redirects.
 */
describe('a page that answers in one language', () => {
  const RUSSIAN_ONLY: Listable[] = [
    { slug: 'citizens', updatedAt: '2026-09-02T10:00:00.000Z', availableLocales: ['ru'] },
  ]

  it('is listed at the URL it actually answers on', () => {
    expect(urls(pageEntries(ORIGIN, ['en', 'ru'], RUSSIAN_ONLY))).toEqual([
      'https://atmjet.com/ru/citizens',
    ])
  })

  it('offers no alternate a crawler would be redirected from', () => {
    const [entry] = pageEntries(ORIGIN, ['en', 'ru'], RUSSIAN_ONLY)

    expect(entry?.alternates?.languages).toEqual({
      ru: 'https://atmjet.com/ru/citizens',
      'x-default': 'https://atmjet.com/ru/citizens',
    })
  })
})

/**
 * The catalogues (issue #171). The legacy `aircraft/sitemap.xml` enumerated the `vehicles` table
 * into unprefixed URLs, and the charter fleet had no sitemap at all
 * (`docs/legacy-inventory.md` section 2.3).
 */
describe('detailEntries', () => {
  const FLEET: Listable[] = [
    { slug: 'azimut-serenity', updatedAt: '2026-09-04T10:00:00.000Z' },
    { slug: 'gulf-craft-marina', updatedAt: '2026-09-05T10:00:00.000Z' },
  ]

  it('lists each document under the listing it is served from', () => {
    expect(urls(detailEntries(ORIGIN, ['en'], 'yachts', FLEET))).toEqual([
      'https://atmjet.com/en/yachts/azimut-serenity',
      'https://atmjet.com/en/yachts/gulf-craft-marina',
    ])
  })

  it('offers the page in every language the site serves, with x-default', () => {
    const [serenity] = detailEntries(ORIGIN, ['en', 'ru'], 'yachts', FLEET)

    expect(serenity.alternates?.languages).toEqual({
      en: 'https://atmjet.com/en/yachts/azimut-serenity',
      ru: 'https://atmjet.com/ru/yachts/azimut-serenity',
      'x-default': 'https://atmjet.com/en/yachts/azimut-serenity',
    })
  })

  it('reports when the document last changed', () => {
    const [serenity] = detailEntries(ORIGIN, ['en'], 'yachts', FLEET)

    expect(serenity.lastModified).toBe('2026-09-04T10:00:00.000Z')
  })

  it('asks a crawler for a page of the site before a page of a catalogue', () => {
    const [aircraft] = detailEntries(ORIGIN, ['en'], 'aircraft', [{ slug: 'm-ouse' }])
    const [home] = pageEntries(ORIGIN, ['en'], PAGES)

    expect(aircraft.priority ?? 1).toBeLessThan(home.priority ?? 0)
  })

  it('leaves out a row the import has not given a slug yet', () => {
    // The listing card has no URL to write for one either, so a sitemap advertising it would be
    // sending a crawler somewhere nothing links to.
    const entries = detailEntries(ORIGIN, ['en'], 'aircraft', [{ slug: null }, { slug: '  ' }])

    expect(entries).toEqual([])
  })

  it('offers nothing while the site serves no locale', () => {
    expect(detailEntries(ORIGIN, [], 'aircraft', FLEET)).toEqual([])
  })
})
