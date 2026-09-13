import type { RequiredDataFromCollectionSlug } from 'payload'
import { uniqueSuffix, type TestRegistry } from '../helpers/payload'

export type LeadData = RequiredDataFromCollectionSlug<'leads'>

export function leadData(overrides: Partial<LeadData> = {}): LeadData {
  const suffix = uniqueSuffix()
  return {
    name: 'A visitor',
    email: `visitor-${suffix}@example.test`,
    phone: '+971 (50) 458-99-26',
    formType: 'booking-dialog',
    source: 'Header',
    locale: 'en',
    ...overrides,
  }
}

export function createLead(registry: TestRegistry, overrides: Partial<LeadData> = {}) {
  return registry.create('leads', leadData(overrides))
}
