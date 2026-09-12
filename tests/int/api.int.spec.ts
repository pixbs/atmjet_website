import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createUser } from '../factories'
import { createRegistry, type TestRegistry } from '../helpers/payload'

let registry: TestRegistry

beforeAll(async () => {
  registry = await createRegistry()
})

afterAll(() => registry.cleanup())

describe('Local API', () => {
  it('creates and reads a user', async () => {
    const user = await createUser(registry)
    const found = await registry.payload.findByID({ collection: 'users', id: user.id })

    expect(found.email).toBe(user.email)
  })

  it('lists users', async () => {
    await createUser(registry)
    const users = await registry.payload.find({ collection: 'users' })

    expect(users.totalDocs).toBeGreaterThan(0)
  })
})
