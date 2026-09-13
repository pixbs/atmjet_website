import type { RequiredDataFromCollectionSlug } from 'payload'
import { uniqueSuffix, type TestRegistry } from '../helpers/payload'

export type UserData = RequiredDataFromCollectionSlug<'users'>

export function userData(overrides: Partial<UserData> = {}): UserData {
  const suffix = uniqueSuffix()
  return {
    email: `user-${suffix}@example.test`,
    password: `pw-${suffix}`,
    // Editor is the default role: the access tests opt into `admin` explicitly, so a test that
    // passes by accident because everyone is an admin cannot happen.
    roles: ['editor'],
    ...overrides,
  }
}

export function createUser(registry: TestRegistry, overrides: Partial<UserData> = {}) {
  return registry.create('users', userData(overrides))
}

/** An administrator, for the cells of the matrix that only they may reach. */
export function createAdmin(registry: TestRegistry, overrides: Partial<UserData> = {}) {
  return createUser(registry, { roles: ['admin'], ...overrides })
}
