import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createMedia, createUser } from '../factories'
import { createRegistry, getTestPayload, uniqueSuffix, type TestRegistry } from '../helpers/payload'

/** Self-test of the integration harness (issue #40): isolation, factories and cleanup. */
let registry: TestRegistry

beforeAll(async () => {
  registry = await createRegistry()
})

afterAll(() => registry.cleanup())

describe('integration harness', () => {
  it('returns one Payload instance per worker', async () => {
    const [first, second] = await Promise.all([getTestPayload(), getTestPayload()])
    expect(first).toBe(second)
  })

  it('generates unique suffixes', () => {
    const suffixes = Array.from({ length: 50 }, () => uniqueSuffix())
    expect(new Set(suffixes).size).toBe(suffixes.length)
  })

  it('creates documents in parallel without collisions and removes them on cleanup', async () => {
    const scoped = await createRegistry()
    const users = await Promise.all(Array.from({ length: 5 }, () => createUser(scoped)))
    expect(new Set(users.map((user) => user.email)).size).toBe(5)
    expect(scoped.size).toBe(5)

    await scoped.cleanup()
    const payload = await getTestPayload()
    const left = await payload.find({
      collection: 'users',
      where: { id: { in: users.map((user) => user.id) } },
    })
    expect(left.totalDocs).toBe(0)
    expect(scoped.size).toBe(0)
  })

  it('uploads media through the factory', async () => {
    const media = await createMedia(registry, { alt: 'Harness image' })
    expect(media.alt).toBe('Harness image')
    expect(media.mimeType).toBe('image/png')
    expect(media.width).toBe(1)
  })
})
