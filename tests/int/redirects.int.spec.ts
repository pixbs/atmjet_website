import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { LEGACY_REDIRECTS, seedRedirects } from '../../scripts/seed/redirects'
import { findRedirect } from '@/lib/data/redirects'
import { createUser } from '../factories'
import { createRegistry, uniqueSuffix, type TestRegistry } from '../helpers/payload'

const revalidateTag = vi.hoisted(() => vi.fn())
vi.mock('next/cache', () => ({ revalidateTag }))

/**
 * The redirect map (issue #69). The legacy five lived in `next.config.mjs`, so changing one meant
 * a deploy (`docs/legacy-inventory.md` section 1.3). What is pinned here is that the seed lands
 * them, that a write invalidates the cached lookup, and that a rule pointing at a page document
 * resolves to that page's path.
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

describe('the seed', () => {
  it('lands the legacy map and reports it unchanged on a second run', async () => {
    const first = await seedRedirects(registry.payload)
    for (const outcome of first) if (outcome.id) registry.track('redirects', outcome.id)

    expect(first).toHaveLength(LEGACY_REDIRECTS.length)
    expect(first.every((outcome) => outcome.action !== 'updated')).toBe(true)

    const second = await seedRedirects(registry.payload)
    expect(second.every((outcome) => outcome.action === 'unchanged')).toBe(true)
  })

  it('sends every legacy URL where the legacy config sent it', async () => {
    const seeded = await seedRedirects(registry.payload)
    for (const outcome of seeded) if (outcome.id) registry.track('redirects', outcome.id)

    const client = () => Promise.resolve(registry.payload)

    expect(await findRedirect('en', '/jets', client)).toEqual({ destination: '/en', status: 308 })
    expect(await findRedirect('en', '/planes', client)).toEqual({
      destination: '/en/aircraft',
      status: 308,
    })
    expect(await findRedirect('ru', '/aircrafts/ra-73025', client)).toEqual({
      destination: '/ru/aircraft/ra-73025',
      status: 308,
    })
    expect(await findRedirect('en', '/yachts', client)).toBeUndefined()
  })
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

/**
 * The map as a whole, rather than one rule at a time (issue #172). A loop reads perfectly well on
 * the row that closes it, and a rule that catches a page's own path hides that page, so the seed
 * checks the collection against the pages before it reports success.
 */
describe('the map as a whole', () => {
  /** Writes rules, runs the seed's check through it, and takes them away again. */
  async function seedWith(rules: Array<{ from: string; to: string; matchSubPaths?: boolean }>) {
    const created = []

    for (const rule of rules) {
      created.push(
        await registry.payload.create({
          collection: 'redirects',
          data: {
            from: rule.from,
            to: { type: 'custom', url: rule.to },
            type: '308',
            matchSubPaths: rule.matchSubPaths ?? false,
          },
          overrideAccess: true,
          context: { skipRevalidation: true },
        }),
      )
    }

    try {
      return await seedRedirects(registry.payload)
    } finally {
      for (const document of created) {
        await registry.payload
          .delete({ collection: 'redirects', id: document.id, overrideAccess: true })
          .catch(() => undefined)
      }
    }
  }

  it('accepts the map the site ships with', async () => {
    await expect(seedWith([])).resolves.toHaveLength(LEGACY_REDIRECTS.length)
  })

  it('refuses a map that sends a visitor round in circles', async () => {
    const suffix = uniqueSuffix()

    await expect(
      seedWith([
        { from: `/${suffix}-here`, to: `/${suffix}-there` },
        { from: `/${suffix}-there`, to: `/${suffix}-here` },
      ]),
    ).rejects.toThrow(/loop/i)
  })

  it('refuses a map that hides a page behind a redirect', async () => {
    const slug = `shadowed-${uniqueSuffix()}`
    const page = await registry.create('pages', {
      title: 'Shadowed',
      slug,
      layout: [],
      _status: 'published',
    })

    await expect(seedWith([{ from: `/${slug}`, to: '/' }])).rejects.toThrow(/unreachable/i)
    expect(page.slug).toBe(slug)
  })

  it('sees a loop that only exists in one language', async () => {
    // A rule may be scoped to a locale, so a map that is sound in English can still loop in
    // Russian; the check runs for each language the content model knows.
    const suffix = uniqueSuffix()
    const created = await registry.payload.create({
      collection: 'redirects',
      data: {
        from: `/${suffix}-ru`,
        to: { type: 'custom', url: `/${suffix}-ru` },
        type: '308',
        locale: 'ru',
      },
      overrideAccess: true,
      context: { skipRevalidation: true },
    })

    try {
      await expect(seedRedirects(registry.payload)).rejects.toThrow(/loop in ru/i)
    } finally {
      await registry.payload
        .delete({ collection: 'redirects', id: created.id, overrideAccess: true })
        .catch(() => undefined)
    }
  })
})
