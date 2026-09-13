import type { RequiredDataFromCollectionSlug } from 'payload'
import type { TestRegistry } from '../helpers/payload'

export type EmptyLegData = RequiredDataFromCollectionSlug<'empty-legs'>

export function emptyLegData(overrides: Partial<EmptyLegData> = {}): EmptyLegData {
  return {
    departureIcao: 'UUWW',
    arrivalIcao: 'LFMN',
    departureAt: '2025-03-05T09:30:00.000Z',
    price: 18_500,
    provenance: { origin: 'manual' },
    ...overrides,
  }
}

export function createEmptyLeg(registry: TestRegistry, overrides: Partial<EmptyLegData> = {}) {
  return registry.create('empty-legs', emptyLegData(overrides))
}
