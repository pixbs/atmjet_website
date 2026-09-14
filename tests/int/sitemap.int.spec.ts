import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { listPagesForSitemap } from '@/lib/data/pages'
import { createRegistry, uniqueSuffix, type TestRegistry } from '../helpers/payload'

const revalidateTag = vi.hoisted(() => vi.fn())
vi.mock('next/cache', () => ({ revalidateTag }))

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
