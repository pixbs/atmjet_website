import type { RequiredDataFromCollectionSlug } from 'payload'
import { uniqueSuffix, type TestRegistry } from '../helpers/payload'

export type YachtData = RequiredDataFromCollectionSlug<'yachts'>

export function yachtData(overrides: Partial<YachtData> = {}): YachtData {
  return {
    name: `Aurora ${uniqueSuffix()}`,
    listingType: 'charter',
    provenance: { origin: 'manual' },
    ...overrides,
  }
}

export function createYacht(registry: TestRegistry, overrides: Partial<YachtData> = {}) {
  return registry.create('yachts', yachtData(overrides))
}
