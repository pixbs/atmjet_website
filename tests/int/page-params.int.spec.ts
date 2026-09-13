import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { DEFAULT_LOCALES } from '@/i18n/locales'
import { listPageParams } from '@/lib/data/pages'
import { createRegistry, uniqueSuffix, type TestRegistry } from '../helpers/payload'

const revalidateTag = vi.hoisted(() => vi.fn())
vi.mock('next/cache', () => ({ revalidateTag }))

/**
 * What `generateStaticParams` prerenders (issue #60). The build is the only place this runs, so
 * the degraded path matters as much as the happy one: a preview whose database is not wired up
 * yet must still deploy, with the pages rendering on demand.
 */
let registry: TestRegistry

beforeAll(async () => {
  registry = await createRegistry()
})

afterAll(() => registry.cleanup())

describe('listPageParams', () => {
  it('returns one entry per published page per enabled locale', async () => {
    const slug = `params-${uniqueSuffix()}`
    await registry.create('pages', { title: 'Params', slug, layout: [], _status: 'published' })

    const params = await listPageParams(DEFAULT_LOCALES)

    for (const locale of DEFAULT_LOCALES) {
      expect(params).toContainEqual({ locale, slug: [slug] })
    }
  })

  it('gives the home page an empty segment list, not a "home" segment', async () => {
    const existing = await registry.payload.find({
      collection: 'pages',
      where: { slug: { equals: '' } },
      overrideAccess: true,
    })

    if (existing.totalDocs === 0) {
      const home = await registry.payload.create({
        collection: 'pages',
        data: { title: 'Home', slug: '', layout: [], _status: 'published' },
        overrideAccess: true,
      })
      registry.track('pages', home.id)
    }

    const params = await listPageParams(['en'])

    expect(params).toContainEqual({ locale: 'en', slug: [] })
  })

  it('leaves a draft out, so it is never prerendered', async () => {
    const slug = `draft-${uniqueSuffix()}`
    const draft = await registry.payload.create({
      collection: 'pages',
      data: { title: 'Draft', slug, layout: [], _status: 'draft' },
      overrideAccess: true,
    })
    registry.track('pages', draft.id)

    const params = await listPageParams(['en'])

    expect(params.some((entry) => entry.slug?.[0] === slug)).toBe(false)
  })

  it('does not let a page without a slug claim the locale root', async () => {
    const unslugged = await registry.payload.create({
      collection: 'pages',
      data: { title: 'No slug yet', layout: [], _status: 'published' },
      overrideAccess: true,
    })
    registry.track('pages', unslugged.id)

    const params = await listPageParams(['en'])
    const homeEntries = params.filter((entry) => (entry.slug ?? []).length === 0)

    // The home page is the one with an empty slug; a page with none has no URL at all.
    expect(homeEntries).toHaveLength(1)
  })

  it('degrades to on-demand rendering when the database cannot be reached', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const unreachable = () => Promise.reject(new Error('cannot connect to Postgres'))

    try {
      // The build fails outright without this guard, which is how it was found: a preview whose
      // database is not wired up yet (issue #34) could not deploy.
      await expect(listPageParams(['en'], unreachable)).resolves.toEqual([])
      expect(warn).toHaveBeenCalledOnce()
    } finally {
      warn.mockRestore()
    }
  })

  it('reports the failure rather than hiding it', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    try {
      await listPageParams(['en'], () => Promise.reject(new Error('boom')))

      expect(String(warn.mock.calls[0]?.[0])).toContain('prerendering skipped')
    } finally {
      warn.mockRestore()
    }
  })
})
