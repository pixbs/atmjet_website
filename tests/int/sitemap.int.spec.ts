import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { canonicalRegistration } from '@/lib/aircraft'
import { listAircraftForSitemap } from '@/lib/data/aircraft'
import { listPagesForSitemap } from '@/lib/data/pages'
import { listCharterYachtsForSitemap } from '@/lib/data/yachts'
import { createMedia, createYacht } from '../factories'
import { createRegistry, uniqueSuffix, type TestRegistry } from '../helpers/payload'

const revalidateTag = vi.hoisted(() => vi.fn())
const revalidatePath = vi.hoisted(() => vi.fn())
vi.mock('next/cache', () => ({ revalidatePath, revalidateTag }))

/**
 * What the sitemap is built from (issue #171). The legacy list was written by hand, so it
 * advertised `/citezens` and no `/sales_yachts` (`docs/legacy-inventory.md` section 2.3); this
 * reads the pages, and what matters is that it reads exactly what a visitor can reach.
 */
let registry: TestRegistry

beforeAll(async () => {
  registry = await createRegistry()
})

afterAll(() => registry.cleanup())

describe('listPagesForSitemap', () => {
  it('lists a published page with the slug it is served at and when it changed', async () => {
    const slug = `sitemap-${uniqueSuffix()}`
    const page = await registry.create('pages', {
      title: 'Listed',
      slug,
      layout: [],
      _status: 'published',
    })

    const listed = (await listPagesForSitemap()).find((entry) => entry.slug === slug)

    expect(listed?.updatedAt).toBe(page.updatedAt)
  })

  it('leaves a draft out, so a crawler is never sent to a page the public cannot open', async () => {
    const slug = `unpublished-${uniqueSuffix()}`
    const draft = await registry.payload.create({
      collection: 'pages',
      data: { title: 'Draft', slug, layout: [], _status: 'draft' },
      overrideAccess: true,
    })
    registry.track('pages', draft.id)

    const slugs = (await listPagesForSitemap()).map((entry) => entry.slug)

    expect(slugs).not.toContain(slug)
  })

  it('reads every locale at once, since a page keeps one slug in all of them', async () => {
    const slug = `shared-${uniqueSuffix()}`
    const page = await registry.create('pages', {
      title: 'English',
      slug,
      layout: [],
      _status: 'published',
    })
    await registry.payload.update({
      collection: 'pages',
      id: page.id,
      data: { title: 'Русский' },
      locale: 'ru',
      overrideAccess: true,
    })

    const listed = (await listPagesForSitemap()).filter((entry) => entry.slug === slug)

    expect(listed).toHaveLength(1)
  })

  it('serves an empty sitemap rather than failing the build without a database', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    try {
      const pages = await listPagesForSitemap(() => Promise.reject(new Error('no database')))

      expect(pages).toEqual([])
      expect(String(warn.mock.calls[0]?.[0])).toContain('sitemap is empty')
    } finally {
      warn.mockRestore()
    }
  })
})

/**
 * The catalogues (issue #171). Both sitemaps exist to offer a crawler the detail pages the
 * legacy site left it to find through a listing, so what matters is that they list the addresses
 * that answer with a page and no others.
 */
describe('listAircraftForSitemap', () => {
  it('lists a catalogued aircraft at the slug its card links to', async () => {
    const photo = await createMedia(registry)
    const slug = `sitemap-aircraft-${uniqueSuffix()}`
    const created = await registry.create('aircraft', {
      registrationDisplay: `RA-${uniqueSuffix().slice(-6)}`,
      slug,
      availability: 'available',
      images: [{ type: 'exterior', media: photo.id }],
      provenance: { origin: 'manual' },
    })

    const listed = (await listAircraftForSitemap()).find((entry) => entry.slug === slug)

    expect(listed?.updatedAt).toBe(created.updatedAt)
  })

  it('names an aircraft without a slug by its registration, which the page resolves', async () => {
    const photo = await createMedia(registry)
    const registration = `RA-${uniqueSuffix().slice(-6)}`
    await registry.create('aircraft', {
      registrationDisplay: registration,
      availability: 'available',
      images: [{ type: 'exterior', media: photo.id }],
      provenance: { origin: 'manual' },
    })

    const slugs = (await listAircraftForSitemap()).map((entry) => entry.slug)

    expect(slugs).toContain(canonicalRegistration(registration))
  })

  it('leaves out an aircraft the catalogue does not show', async () => {
    const photo = await createMedia(registry)
    const unavailable = `sitemap-withdrawn-${uniqueSuffix()}`
    const uncovered = `sitemap-coverless-${uniqueSuffix()}`
    await registry.create('aircraft', {
      registrationDisplay: `RA-${uniqueSuffix().slice(-6)}`,
      slug: unavailable,
      availability: 'unavailable',
      images: [{ type: 'exterior', media: photo.id }],
      provenance: { origin: 'manual' },
    })
    // An aircraft nothing links to: the listing draws a card from its exterior photograph.
    await registry.create('aircraft', {
      registrationDisplay: `RA-${uniqueSuffix().slice(-6)}`,
      slug: uncovered,
      availability: 'available',
      images: [],
      provenance: { origin: 'manual' },
    })

    const slugs = (await listAircraftForSitemap()).map((entry) => entry.slug)

    expect(slugs).not.toContain(unavailable)
    expect(slugs).not.toContain(uncovered)
  })

  it('serves an empty sitemap rather than failing the build without a database', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    try {
      const aircraft = await listAircraftForSitemap(() => Promise.reject(new Error('no database')))

      expect(aircraft).toEqual([])
      expect(String(warn.mock.calls[0]?.[0])).toContain('sitemap is empty')
    } finally {
      warn.mockRestore()
    }
  })
})

describe('listCharterYachtsForSitemap', () => {
  it('lists a charter yacht with a photograph', async () => {
    const photo = await createMedia(registry)
    const slug = `sitemap-yacht-${uniqueSuffix()}`
    const created = await createYacht(registry, { slug, photos: [{ media: photo.id }] })

    const listed = (await listCharterYachtsForSitemap()).find((entry) => entry.slug === slug)

    expect(listed?.updatedAt).toBe(created.updatedAt)
  })

  it('leaves out a yacht whose page redirects to the listing', async () => {
    const photo = await createMedia(registry)
    const bare = `sitemap-bare-${uniqueSuffix()}`
    const forSale = `sitemap-sale-${uniqueSuffix()}`
    // No photographs: the detail page redirects rather than drawing an empty gallery (#140).
    await createYacht(registry, { slug: bare, photos: [] })
    // The sale catalogue has no detail page at all; it is a card in a section.
    await createYacht(registry, {
      slug: forSale,
      listingType: 'sale',
      photos: [{ media: photo.id }],
    })

    const slugs = (await listCharterYachtsForSitemap()).map((entry) => entry.slug)

    expect(slugs).not.toContain(bare)
    expect(slugs).not.toContain(forSale)
  })

  it('serves an empty sitemap rather than failing the build without a database', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    try {
      const yachts = await listCharterYachtsForSitemap(() =>
        Promise.reject(new Error('no database')),
      )

      expect(yachts).toEqual([])
      expect(String(warn.mock.calls[0]?.[0])).toContain('sitemap is empty')
    } finally {
      warn.mockRestore()
    }
  })
})
