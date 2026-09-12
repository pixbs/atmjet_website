import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { runSeed } from '../../scripts/seed'
import { SEED_IMAGES } from '../../scripts/seed/media'
import { SEED_ADMIN } from '../../scripts/seed/users'
import { createRegistry, type TestRegistry } from '../helpers/payload'

let registry: TestRegistry

beforeAll(async () => {
  registry = await createRegistry()
})

afterAll(() => registry.cleanup())

describe('seed', () => {
  it('creates the fixture content once and reports unchanged on the second run', async () => {
    const first = await runSeed(registry.payload)
    for (const outcome of first.outcomes)
      if (outcome.id !== undefined)
        registry.track(outcome.collection as 'users' | 'media', outcome.id)
    expect(first.created + first.unchanged).toBe(1 + SEED_IMAGES.length)

    const second = await runSeed(registry.payload)
    expect(second.created).toBe(0)
    expect(second.updated).toBe(0)
    expect(second.unchanged).toBe(1 + SEED_IMAGES.length)

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
  })
})
