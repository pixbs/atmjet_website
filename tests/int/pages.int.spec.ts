import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { PAGE_SLUGS, pathForPage } from '@/collections/Pages'
import { createAdmin, createUser } from '../factories'
import { createRegistry, uniqueSuffix, type TestRegistry } from '../helpers/payload'

// Media and Pages both revalidate on write, which needs a Next request scope this suite has not
// got; the binding swallows that, but mocking keeps the output quiet and lets tags be asserted.
const revalidateTag = vi.hoisted(() => vi.fn())
vi.mock('next/cache', () => ({ revalidateTag }))

/**
 * The Pages collection (issue #60). It is the shell every ported section and page depends on,
 * so what is pinned here is the contract E7 and E8 build on: slugs, drafts, access and the
 * path a document is served at.
 */
let registry: TestRegistry

beforeAll(async () => {
  registry = await createRegistry()
})

afterAll(() => registry.cleanup())

const pageData = (overrides: Record<string, unknown> = {}) => ({
  title: `Page ${uniqueSuffix()}`,
  slug: `page-${uniqueSuffix()}`,
  layout: [],
  ...overrides,
})

describe('page paths', () => {
  it('serves the empty slug at the locale root rather than /en/home', () => {
    expect(pathForPage('en', '')).toBe('/en')
    expect(pathForPage('ru', '')).toBe('/ru')
  })

  it('puts every other page under its locale', () => {
    expect(pathForPage('en', 'empty_legs')).toBe('/en/empty_legs')
    expect(pathForPage('ru', 'empty_legs')).toBe('/ru/empty_legs')
  })

  it('covers the thirteen static routes of the legacy site', () => {
    expect(PAGE_SLUGS).toHaveLength(13)
    expect(PAGE_SLUGS).toContain('')
    expect(PAGE_SLUGS).toContain('sales_yachts')
    // The legacy slugs use underscores; parity depends on keeping them.
    expect(PAGE_SLUGS.filter((slug) => slug.includes('-'))).toEqual([])
  })
})

describe('slugs', () => {
  it('refuses a second page with the same slug', async () => {
    const slug = `duplicate-${uniqueSuffix()}`
    await registry.create('pages', pageData({ slug }))

    await expect(registry.create('pages', pageData({ slug }))).rejects.toThrow()
  })

  it('keeps one slug across locales, so a URL is the same in every language', async () => {
    const page = await registry.create('pages', pageData({ slug: `shared-${uniqueSuffix()}` }))

    await registry.payload.update({
      collection: 'pages',
      id: page.id,
      data: { title: 'Переведённая страница' },
      locale: 'ru',
      overrideAccess: true,
    })

    const russian = await registry.payload.findByID({
      collection: 'pages',
      id: page.id,
      locale: 'ru',
    })

    expect(russian.title).toBe('Переведённая страница')
    expect(russian.slug).toBe(page.slug)
  })
})

describe('drafts', () => {
  it('hides a draft from the public and shows it to an editor', async () => {
    const editor = await createUser(registry)
    const draft = await registry.payload.create({
      collection: 'pages',
      data: pageData({ _status: 'draft' }),
      overrideAccess: true,
    })
    registry.track('pages', draft.id)

    const publicRead = await registry.payload.find({
      collection: 'pages',
      where: { id: { equals: draft.id } },
      overrideAccess: false,
    })
    expect(publicRead.totalDocs).toBe(0)

    const editorRead = await registry.payload.find({
      collection: 'pages',
      where: { id: { equals: draft.id } },
      overrideAccess: false,
      user: editor,
    })
    expect(editorRead.totalDocs).toBe(1)
  })

  it('shows a page to the public once it is published', async () => {
    const page = await registry.payload.create({
      collection: 'pages',
      data: pageData({ _status: 'draft' }),
      overrideAccess: true,
    })
    registry.track('pages', page.id)

    await registry.payload.update({
      collection: 'pages',
      id: page.id,
      data: { _status: 'published' },
      overrideAccess: true,
    })

    const publicRead = await registry.payload.find({
      collection: 'pages',
      where: { id: { equals: page.id } },
      overrideAccess: false,
    })

    expect(publicRead.totalDocs).toBe(1)
  })

  it('keeps versions, so an edit can be rolled back', async () => {
    const page = await registry.create('pages', pageData({ _status: 'published' }))

    await registry.payload.update({
      collection: 'pages',
      id: page.id,
      data: { title: 'Second title' },
      overrideAccess: true,
    })

    const versions = await registry.payload.findVersions({
      collection: 'pages',
      where: { parent: { equals: page.id } },
      overrideAccess: true,
    })

    expect(versions.totalDocs).toBeGreaterThan(0)
  })
})

describe('access', () => {
  it('is not writable anonymously', async () => {
    await expect(
      registry.payload.create({ collection: 'pages', data: pageData(), overrideAccess: false }),
    ).rejects.toThrow()
  })

  for (const role of ['editor', 'admin'] as const) {
    it(`is writable by an ${role}`, async () => {
      const user = role === 'admin' ? await createAdmin(registry) : await createUser(registry)

      const created = await registry.payload.create({
        collection: 'pages',
        data: pageData(),
        overrideAccess: false,
        user,
      })
      registry.track('pages', created.id)

      expect(created.id).toBeDefined()
    })
  }
})

describe('revalidation', () => {
  it('drops the cached HTML of a page when it is saved', async () => {
    revalidateTag.mockClear()
    await registry.create('pages', pageData({ _status: 'published' }))

    const tags = revalidateTag.mock.calls.map(([tag]) => tag as string)

    expect(tags).toContain('pages')
  })
})

describe('live preview', () => {
  it('points an editor at the page they are editing, in the locale they are editing', async () => {
    const config = await registry.payload.config
    const pages = config.collections.find((collection) => collection.slug === 'pages')
    const url = pages?.admin.livePreview?.url

    expect(typeof url).toBe('function')

    const build = (locale: string, slug: string) =>
      (url as (args: unknown) => string)({
        data: { slug },
        req: { locale, payload: { config } },
      })

    expect(build('en', 'empty_legs')).toBe(`${config.serverURL}/en/empty_legs`)
    expect(build('ru', 'empty_legs')).toBe(`${config.serverURL}/ru/empty_legs`)
    // The home page previews at the locale root, not /en/home.
    expect(build('en', '')).toBe(`${config.serverURL}/en`)
  })

  it('still builds a URL for a document the admin has not filled in yet', async () => {
    const config = await registry.payload.config
    const pages = config.collections.find((collection) => collection.slug === 'pages')
    const url = pages?.admin.livePreview?.url as (args: unknown) => string

    // Autosave fires on a new document before a slug or a locale is settled, so neither may be
    // assumed; the preview falls back to the default locale's home page rather than throwing.
    expect(url({ data: undefined, req: { payload: { config } } })).toBe(`${config.serverURL}/en`)
  })
})

describe('seo', () => {
  it('gives every page localized meta fields', async () => {
    const page = await registry.create('pages', pageData())

    await registry.payload.update({
      collection: 'pages',
      id: page.id,
      data: { meta: { title: 'English meta' } },
      locale: 'en',
      overrideAccess: true,
    })
    await registry.payload.update({
      collection: 'pages',
      id: page.id,
      // `title` is required and localized, so writing the Russian locale supplies it too.
      data: { title: 'Русская страница', meta: { title: 'Русское описание' } },
      locale: 'ru',
      overrideAccess: true,
    })

    const english = await registry.payload.findByID({ collection: 'pages', id: page.id })
    const russian = await registry.payload.findByID({
      collection: 'pages',
      id: page.id,
      locale: 'ru',
    })

    expect(english.meta?.title).toBe('English meta')
    expect(russian.meta?.title).toBe('Русское описание')
  })
})
