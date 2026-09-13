import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { runSeed } from '../../scripts/seed'
import { SEED_IMAGES } from '../../scripts/seed/media'
import { SEED_ADMIN } from '../../scripts/seed/users'
import { PAGE_SLUGS } from '../../src/collections/Pages'
import { createRegistry, type TestRegistry } from '../helpers/payload'

/** One admin, the placeholder images, and one page per static route (issues #41 and #60). */
const EXPECTED_DOCUMENTS = 1 + SEED_IMAGES.length + PAGE_SLUGS.length

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
          registry.track(outcome.collection as 'users' | 'media' | 'pages', outcome.id)
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

      // Every static route has a published page, so no environment renders an empty site.
      const pages = await registry.payload.find({
        collection: 'pages',
        where: { slug: { in: [...PAGE_SLUGS] } },
        limit: 0,
        overrideAccess: true,
      })
      expect(pages.totalDocs).toBe(PAGE_SLUGS.length)
      expect(pages.docs.every((doc) => doc._status === 'published')).toBe(true)
    },
    SEED_TIMEOUT,
  )
})
