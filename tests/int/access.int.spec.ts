import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createUser } from '../factories'
import { createRegistry, type TestRegistry } from '../helpers/payload'

/**
 * Access-control matrix (docs/adr/0004). Every collection added later extends this file with
 * anonymous, authenticated and admin expectations for read, create, update and delete.
 */
let registry: TestRegistry

beforeAll(async () => {
  registry = await createRegistry()
})

afterAll(() => registry.cleanup())

describe('access control', () => {
  it('lets anonymous requests read media', async () => {
    const result = await registry.payload.find({ collection: 'media', overrideAccess: false })

    expect(Array.isArray(result.docs)).toBe(true)
  })

  it('does not expose users to anonymous requests', async () => {
    await expect(
      registry.payload.find({ collection: 'users', overrideAccess: false }),
    ).rejects.toThrow()
  })

  it('lets an authenticated user read users', async () => {
    const user = await createUser(registry)
    const result = await registry.payload.find({ collection: 'users', overrideAccess: false, user })

    expect(result.docs.some((doc) => doc.id === user.id)).toBe(true)
  })

  it('does not let anonymous requests create users', async () => {
    await expect(
      registry.payload.create({
        collection: 'users',
        data: { email: 'nobody@example.test', password: 'x' },
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })
})
