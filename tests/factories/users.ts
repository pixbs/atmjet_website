import type { RequiredDataFromCollectionSlug } from 'payload'
import { uniqueSuffix, type TestRegistry } from '../helpers/payload'

export type UserData = RequiredDataFromCollectionSlug<'users'>

export function userData(overrides: Partial<UserData> = {}): UserData {
  const suffix = uniqueSuffix()
  return { email: `user-${suffix}@example.test`, password: `pw-${suffix}`, ...overrides }
}

export function createUser(registry: TestRegistry, overrides: Partial<UserData> = {}) {
  return registry.create('users', userData(overrides))
}
