import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { findRedirect } from '@/lib/data/redirects'

import { runSeed } from '../../scripts/seed'
import { SEEDED_GLOBALS } from '../../scripts/seed/globals'
import { SEED_IMAGES } from '../../scripts/seed/media'
import { LEGACY_REDIRECTS, seedRedirects } from '../../scripts/seed/redirects'
import { SEED_ADMIN } from '../../scripts/seed/users'
import { PAGE_SLUGS } from '../../src/collections/Pages'
import { createRegistry, uniqueSuffix, type TestRegistry } from '../helpers/payload'

// Writing a redirect asks Next to drop a cache tag, which needs a request scope this suite has
// not got; the binding swallows that, and mocking keeps the output quiet.
const revalidateTag = vi.hoisted(() => vi.fn())
vi.mock('next/cache', () => ({ revalidateTag }))

/**
 * The seed, and the only suite in this tier that runs any part of it (issues #41, #60, #61, #69
 * and #306).
 *
 * What the seed writes is keyed by natural keys rather than by `uniqueSuffix`: thirteen pages by
 * slug, two uploads by filename, five redirects by path and two globals. Vitest gives every file
 * its own worker against one database, so a second suite that seeds — or that deletes what the
 * seed wrote — races this one: a cleanup landing between two runs makes the second report
 * `created` where idempotency says `unchanged`, which is how the tier came to fail about one run
 * in three.
 *
 * The fixture therefore has exactly one owner. This file runs the seed and leaves what it wrote
 * in place: nothing of it is registered for cleanup, which is also what lets the build that
 * follows the tier read the pages it is meant to prerender. `tests/unit/seed-ownership.test.ts`
 * keeps the next suite that wants a seeded document from taking the shortcut again.
 */
const EXPECTED_DOCUMENTS =
  1 + SEED_IMAGES.length + PAGE_SLUGS.length + SEEDED_GLOBALS.length + LEGACY_REDIRECTS.length

let registry: TestRegistry

beforeAll(async () => {
  registry = await createRegistry()
})

// Only the documents the tests below create. The fixture outlives them all.
afterAll(() => registry.cleanup())

/**
 * Two full seed runs, each writing an admin, the placeholder uploads (which sharp resizes) and a
 * page per static route. It is the heaviest test in the suite, and Vitest runs every file in its
 * own worker against one database, so the five-second default is not a bound on this test being
 * correct — it is a bound on how busy the other workers are. Sixty seconds is.
 */
const SEED_TIMEOUT = 60_000

describe('seed', () => {
  it(
    'writes every document of the fixture and reports it unchanged on the next run',
    async () => {
      // Whether this run creates the fixture or finds it already there, every expected document
      // is reported in exactly one bucket.
      const first = await runSeed(registry.payload)
      expect(first.created + first.unchanged + first.updated).toBe(EXPECTED_DOCUMENTS)

      const second = await runSeed(registry.payload)
      expect(second.created).toBe(0)
      expect(second.unchanged + second.updated).toBe(EXPECTED_DOCUMENTS)

      // Every document of it is untouched. The globals are exempt from that and not from the sum
      // above: a global is a single document, so a suite in a parallel worker may have written
      // its own navigation over the seed's, and the next run repairs a menu whose pages have
      // gone rather than leaving it broken (issue #260).
      const documents = second.outcomes.filter((outcome) => outcome.collection !== 'globals')
      expect(documents.filter((outcome) => outcome.action !== 'unchanged')).toEqual([])

      const users = await registry.payload.find({
        collection: 'users',
        where: { email: { equals: SEED_ADMIN.email } },
      })
      expect(users.totalDocs).toBe(1)
      const media = await registry.payload.find({
        collection: 'media',
        where: { filename: { in: SEED_IMAGES.map((image) => image.filename) } },
      })
      expect(media.totalDocs).toBe(SEED_IMAGES.length)
      expect(media.docs.every((doc) => doc.width === 1280 && doc.height === 720)).toBe(true)

      // Every legacy URL that must keep resolving has a rule (issue #69).
      const redirects = await registry.payload.find({
        collection: 'redirects',
        where: { from: { in: LEGACY_REDIRECTS.map((entry) => entry.from) } },
        limit: 0,
        overrideAccess: true,
      })
      expect(redirects.totalDocs).toBe(LEGACY_REDIRECTS.length)

      // Every static route has a published page, so no environment renders an empty site.
      const pages = await registry.payload.find({
        collection: 'pages',
        where: { slug: { in: [...PAGE_SLUGS] } },
        limit: 0,
        overrideAccess: true,
      })
      expect(pages.totalDocs).toBe(PAGE_SLUGS.length)
      expect(pages.docs.every((doc) => doc._status === 'published')).toBe(true)

      // The chrome is filled in rather than left as an empty menu (issue #61). What it holds is
      // asserted in tests/int/globals.int.spec.ts.
      expect(first.outcomes.filter((outcome) => outcome.collection === 'globals')).toHaveLength(
        SEEDED_GLOBALS.length,
      )
    },
    SEED_TIMEOUT,
  )
})

/**
 * The redirect map the seed lands (issue #69), and the check it runs over the whole collection
 * before it reports success (issue #172). Both live here rather than beside the collection,
 * because both run the seed.
 */
describe('the redirect map', () => {
  it('lands the legacy map and reports it unchanged on a second run', async () => {
    const first = await seedRedirects(registry.payload)

    expect(first).toHaveLength(LEGACY_REDIRECTS.length)
    expect(first.every((outcome) => outcome.action !== 'updated')).toBe(true)

    const second = await seedRedirects(registry.payload)
    expect(second.every((outcome) => outcome.action === 'unchanged')).toBe(true)
  })

  it('sends every legacy URL where the legacy config sent it', async () => {
    await seedRedirects(registry.payload)

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
