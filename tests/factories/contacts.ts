import type { RequiredDataFromCollectionSlug } from 'payload'
import { uniqueSuffix, type TestRegistry } from '../helpers/payload'

export type ContactData = RequiredDataFromCollectionSlug<'contacts'>

export function contactData(overrides: Partial<ContactData> = {}): ContactData {
  const suffix = uniqueSuffix()
  return {
    name: `Contact ${suffix}`,
    role: 'Captain',
    phone: '+971 50 458 99 26',
    email: `contact-${suffix}@example.test`,
    provenance: { origin: 'manual' },
    ...overrides,
  }
}

export function createContact(registry: TestRegistry, overrides: Partial<ContactData> = {}) {
  return registry.create('contacts', contactData(overrides))
}
