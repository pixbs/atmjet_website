import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { findRedirect } from '@/lib/data/redirects'
import { createUser } from '../factories'
import { createRegistry, uniqueSuffix, type TestRegistry } from '../helpers/payload'

const revalidateTag = vi.hoisted(() => vi.fn())
vi.mock('next/cache', () => ({ revalidateTag }))

/**
 * The redirect map (issue #69). The legacy five lived in `next.config.mjs`, so changing one meant
 * a deploy (`docs/legacy-inventory.md` section 1.3). What is pinned here is the collection: that
 * a write invalidates the cached lookup, that a rule pointing at a page resolves to that page's
 * path, and what a rule may not be.
 *
 * What the seed lands, and the check it runs over the whole map, belong to
 * `tests/int/seed.int.spec.ts`: the seeded rules are shared fixture content and one suite owns
 * it (issue #306).
 */
let registry: TestRegistry

beforeAll(async () => {
  registry = await createRegistry()
})

afterAll(() => registry.cleanup())

const redirect = (overrides: Record<string, unknown> = {}) => ({
  from: `/legacy-${uniqueSuffix()}`,
  to: { type: 'custom' as const, url: '/aircraft' },
  type: '308' as const,
  ...overrides,
})

describe('a rule that points at a page', () => {
  it('resolves to that page, so a renamed slug cannot leave a dangling redirect', async () => {
    const page = await registry.create('pages', {
      title: 'Aircraft',
      slug: `fleet-${uniqueSuffix()}`,
      _status: 'published',
    })

    const created = await registry.create(
      'redirects',
      redirect({ to: { type: 'reference', reference: { relationTo: 'pages', value: page.id } } }),
    )

    const client = () => Promise.resolve(registry.payload)
    expect((await findRedirect('en', created.from, client))?.destination).toBe(`/en/${page.slug}`)
  })
})

describe('validation', () => {
  it('stores one spelling of a path, whatever an editor types', async () => {
    const created = await registry.create(
      'redirects',
      redirect({ from: `legacy-${uniqueSuffix()}/`, to: { type: 'custom', url: 'aircraft/' } }),
    )

    expect(created.from.startsWith('/legacy-')).toBe(true)
    expect(created.from.endsWith('/')).toBe(false)
    expect(created.to?.url).toBe('/aircraft')
  })

  it('refuses a redirect with nowhere to send anybody', async () => {
    await expect(
      registry.create('redirects', redirect({ to: { type: 'custom', url: '' } })),
    ).rejects.toThrow()

    await expect(
      registry.create('redirects', redirect({ to: { type: 'reference', reference: null } })),
    ).rejects.toThrow()
  })

  it('refuses a second rule on the same path, so one URL has one destination', async () => {
    const from = `/duplicate-${uniqueSuffix()}`
    await registry.create('redirects', redirect({ from }))

    await expect(registry.create('redirects', redirect({ from }))).rejects.toThrow()
  })
})

describe('access and caching', () => {
  it('is readable without a session, because a visitor following an old link has none', async () => {
    await registry.create('redirects', redirect())

    const found = await registry.payload.find({ collection: 'redirects', overrideAccess: false })

    expect(found.totalDocs).toBeGreaterThan(0)
  })

  it('is not writable anonymously and is writable by an editor', async () => {
    await expect(
      registry.payload.create({
        collection: 'redirects',
        data: redirect(),
        overrideAccess: false,
      }),
    ).rejects.toThrow()

    const editor = await createUser(registry)
    const created = await registry.payload.create({
      collection: 'redirects',
      data: redirect(),
      overrideAccess: false,
      user: editor,
    })
    registry.track('redirects', created.id)

    expect(created.id).toBeDefined()
  })

  it('drops the cached lookup when a rule is saved', async () => {
    revalidateTag.mockClear()
    await registry.create('redirects', redirect())

    expect(revalidateTag.mock.calls.map(([tag]) => tag as string)).toContain('redirects')
  })
})

describe('a database that cannot be reached', () => {
  it('leaves the 404 a 404 rather than turning it into a 500', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    const match = await findRedirect('en', '/planes', () =>
      Promise.reject(new Error('connection refused')),
    )

    expect(match).toBeUndefined()
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })
})
