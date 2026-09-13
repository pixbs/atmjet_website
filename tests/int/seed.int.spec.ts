import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { runSeed } from '../../scripts/seed'
import { SEEDED_GLOBALS } from '../../scripts/seed/globals'
import { SEED_IMAGES } from '../../scripts/seed/media'
import { LEGACY_REDIRECTS } from '../../scripts/seed/redirects'
import { SEED_ADMIN } from '../../scripts/seed/users'
import { PAGE_SLUGS } from '../../src/collections/Pages'
import { createRegistry, type TestRegistry } from '../helpers/payload'

/**
 * One admin, the placeholder images, one page per static route, the chrome globals and the
 * legacy redirect map (issues #41, #60, #61 and #69).
 */
const EXPECTED_DOCUMENTS =
  1 + SEED_IMAGES.length + PAGE_SLUGS.length + SEEDED_GLOBALS.length + LEGACY_REDIRECTS.length

let registry: TestRegistry

beforeAll(async () => {
  registry = await createRegistry()
})

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
    'creates the fixture content once and reports unchanged on the second run',
    async () => {
      const first = await runSeed(registry.payload)
      for (const outcome of first.outcomes)
        if (outcome.id !== undefined)
          registry.track(
            outcome.collection as 'users' | 'media' | 'pages' | 'redirects',
            outcome.id,
          )
      expect(first.created + first.unchanged).toBe(EXPECTED_DOCUMENTS)

      const second = await runSeed(registry.payload)
      expect(second.created).toBe(0)
      expect(second.updated).toBe(0)
      expect(second.unchanged).toBe(EXPECTED_DOCUMENTS)

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
      // asserted in tests/int/globals.int.spec.ts: a global is a single document, so a suite
      // running in a parallel worker may already have written its own navigation over the seed's.
      expect(first.outcomes.filter((outcome) => outcome.collection === 'globals')).toHaveLength(
        SEEDED_GLOBALS.length,
      )
    },
    SEED_TIMEOUT,
  )
})
