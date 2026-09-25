import { describe, expect, it } from 'vitest'

import {
  fromVehicle,
  isPlane,
  vehicleSlug,
  type ExistingAircraft,
  type VehiclesRow,
} from '../../scripts/migrate/vehicles'

/**
 * What a plane row of `vehicles` becomes (issue #79), away from a database: a document of its
 * own, or the missing parts of the catalogue document with the same registration.
 */
const row = (fields: Partial<VehiclesRow> = {}): VehiclesRow => ({
  id: 12,
  tail_number: 'RA-73025',
  tail_model: 'Gulfstream G650',
  tail_manufacturer: 'Gulfstream',
  tail_year: '2014',
  tail_maxpax: '14',
  tail_operator: 'Rus Jet',
  tail_interiorrefit: '2020',
  tail_exteriorrefit: null,
  tail_homebase: 'uuww',
  image: 'atmjet.ams3.digitaloceanspaces.com/planes/ra-73025.jpg',
  thumb: '',
  price: '0.00',
  source: 1,
  yacht_builder: null,
  ...fields,
})

const context = {
  runId: 'run-2',
  importedAt: '2026-09-25T00:00:00.000Z',
  airports: new Map([['UUWW', 7]]),
}

const catalogued = (fields: Partial<ExistingAircraft> = {}): ExistingAircraft => ({
  registrationDisplay: 'RA-73025',
  type: { name: 'G650', model: null, manufacturer: null },
  specification: { yearOfProduction: 2016, passengers: null },
  operator: { companyName: 'Catalogue Air' },
  baseAirport: null,
  legacyAttributes: { verified_at: '2024-05-01' },
  provenance: { origin: 'aircrafts-catalog', legacyAircraftId: 3, mergedFrom: [] },
  ...fields,
})

describe('a vehicles row', () => {
  it('is a plane when it has a tail number, and a yacht otherwise', () => {
    expect(isPlane(row())).toBe(true)
    expect(isPlane(row({ tail_number: '  ' }))).toBe(false)
    expect(isPlane(row({ tail_number: null }))).toBe(false)
  })

  it('is served at the tail number the legacy sitemap wrote', () => {
    expect(vehicleSlug(' RA-73025 ')).toBe('RA-73025')
    expect(vehicleSlug('RA 73025')).toBe('RA-73025')
  })
})

describe('a plane the catalogue does not have', () => {
  it('becomes a vehicles-legacy document with its own provenance', () => {
    expect(fromVehicle(row(), undefined, context).data).toMatchObject({
      registrationDisplay: 'RA-73025',
      slug: 'RA-73025',
      type: { model: 'Gulfstream G650', manufacturer: 'Gulfstream' },
      specification: { yearOfProduction: 2014, passengers: 14, interiorRefit: '2020' },
      operator: { companyName: 'Rus Jet' },
      baseAirport: 7,
      provenance: {
        origin: 'vehicles-legacy',
        legacyVehicleId: 12,
        legacyTailNumber: 'RA-73025',
        importRunId: 'run-2',
      },
    })
  })

  it('keeps its image with the scheme the legacy card added, outside the photographs', () => {
    const { data } = fromVehicle(row(), undefined, context)

    expect(data).not.toHaveProperty('images')
    expect(data.legacyAttributes).toEqual({
      vehicles: {
        12: {
          image: 'https://atmjet.ams3.digitaloceanspaces.com/planes/ra-73025.jpg',
          price: '0.00',
          source: 1,
          tail_homebase: 'uuww',
        },
      },
    })
  })

  it('keeps a year or a count it cannot read as the row wrote it', () => {
    const { data } = fromVehicle(row({ tail_year: 'n/a', tail_maxpax: '12+' }), undefined, context)

    expect(data.specification).not.toHaveProperty('yearOfProduction')
    expect(data.legacyAttributes).toMatchObject({
      vehicles: { 12: { tail_year: 'n/a', tail_maxpax: '12+' } },
    })
  })
})

describe('a plane the catalogue already has', () => {
  it('fills only what the catalogue left empty', () => {
    const { data } = fromVehicle(row(), catalogued(), context)

    expect(data).toMatchObject({
      registrationDisplay: 'RA-73025',
      type: { name: 'G650', model: 'Gulfstream G650', manufacturer: 'Gulfstream' },
      specification: { yearOfProduction: 2016, passengers: 14, interiorRefit: '2020' },
      operator: { companyName: 'Catalogue Air' },
      baseAirport: 7,
    })
  })

  it('keeps the catalogue origin and lists the row it merged', () => {
    expect(fromVehicle(row(), catalogued(), context).data.provenance).toMatchObject({
      origin: 'aircrafts-catalog',
      legacyAircraftId: 3,
      legacyVehicleId: 12,
      legacyTailNumber: 'RA-73025',
      mergedFrom: [{ table: 'vehicles', legacyId: 12 }],
    })
  })

  it('does not list the same row twice, and keeps what the catalogue kept', () => {
    const existing = catalogued({
      provenance: {
        origin: 'aircrafts-catalog',
        mergedFrom: [{ id: 'row-1', table: 'vehicles', legacyId: 12 }],
      },
    })
    const { data } = fromVehicle(row(), existing, context)

    expect(data.provenance.mergedFrom).toEqual([{ table: 'vehicles', legacyId: 12 }])
    expect(data.legacyAttributes).toMatchObject({ verified_at: '2024-05-01' })
  })
})
