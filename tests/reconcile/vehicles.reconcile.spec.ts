import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { importCatalogue } from '../../scripts/migrate/aircraft'
import { importAirports } from '../../scripts/migrate/airports'
import { failures, reconcile, vehicleChecks } from '../../scripts/migrate/reconcile'
import { importVehicles } from '../../scripts/migrate/vehicles'
import { getTestPayload } from '../helpers/payload'
import { dropFixture, FIXTURE_SCHEMA, loadFixture } from './fixture'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }))

/**
 * The planes of `vehicles` (issue #79) merged into the catalogue imported before them, and
 * reconciled: no registration twice, every legacy sitemap URL answered, every merge recorded.
 */
let payload: Payload

const aircraft = async (registration: string) => {
  const { docs } = await payload.find({
    collection: 'aircraft',
    where: { registration: { equals: registration } },
    overrideAccess: true,
    depth: 0,
  })

  return docs[0]
}

beforeAll(async () => {
  payload = await getTestPayload()
  await loadFixture(payload, ['airports.sql', 'aircraft.sql', 'vehicles.sql'])
  await importAirports(payload, { schema: FIXTURE_SCHEMA })
  await importCatalogue(payload, { schema: FIXTURE_SCHEMA })
})

afterAll(async () => {
  await dropFixture(payload)
})

describe('merging the planes of vehicles', () => {
  it('imports the plane rows, not the yachts, and reconciles', async () => {
    const report = await importVehicles(payload, { schema: FIXTURE_SCHEMA })

    // Four planes: one into the catalogue's ZZ-001, one new, one into that new one, one new.
    expect(report).toMatchObject({ read: 4, created: 2, updated: 2 })
    expect(failures(await reconcile(payload, vehicleChecks(FIXTURE_SCHEMA)))).toEqual([])
  })

  it('lets the catalogue win, and fills only what it left empty', async () => {
    expect(await aircraft('ZZ001')).toMatchObject({
      registrationDisplay: 'ZZ-001',
      slug: 'zzjet-zz-001',
      type: { name: 'ZZJet 6000', model: 'ZZJet 6000 ER', manufacturer: 'Zed Aerospace' },
      specification: { yearOfProduction: 2016, passengers: 14, interiorRefit: '2021' },
      operator: { companyName: 'Zed Air' },
      provenance: {
        origin: 'aircrafts-catalog',
        legacyAircraftId: 1,
        legacyVehicleId: 1,
        legacyTailNumber: 'zz-001',
        mergedFrom: [expect.objectContaining({ table: 'vehicles', legacyId: 1 })],
      },
      legacyAttributes: {
        vehicles: {
          1: expect.objectContaining({
            image: 'https://atmjet.ams3.digitaloceanspaces.com/planes/zz-001.jpg',
            tail_homebase: 'ZZAB',
            vendor: 3,
          }),
        },
      },
    })
    // Its three catalogue photographs stay the only ones.
    expect((await aircraft('ZZ001'))?.images).toHaveLength(3)
  })

  it('gives a plane only vehicles had a document at its legacy URL, with the second row merged in', async () => {
    const seven = await aircraft('ZZ777')

    expect(seven).toMatchObject({
      registrationDisplay: 'ZZ-777',
      slug: 'ZZ-777',
      type: { model: 'ZZProp 777', manufacturer: 'Zed Aerospace' },
      specification: { yearOfProduction: 2011, passengers: 12, exteriorRefit: '2019' },
      operator: { companyName: 'Seven Air' },
      provenance: {
        origin: 'vehicles-legacy',
        legacyVehicleId: 2,
        mergedFrom: [expect.objectContaining({ table: 'vehicles', legacyId: 4 })],
      },
    })
    expect(seven?.images ?? []).toEqual([])
    expect(seven?.baseAirport).toEqual(expect.any(Number))
  })

  it('keeps a value no field can take in legacyAttributes', async () => {
    expect((await aircraft('ZZ888'))?.legacyAttributes).toMatchObject({
      vehicles: { 5: { tail_year: 'n/a', tail_homebase: 'QQZZ' } },
    })
  })

  it('leaves the same aircraft behind when it is run again', async () => {
    const report = await importVehicles(payload, { schema: FIXTURE_SCHEMA })

    expect(report).toMatchObject({ read: 4, skipped: 4, created: 0, updated: 0 })
    expect(failures(await reconcile(payload, vehicleChecks(FIXTURE_SCHEMA)))).toEqual([])
  })

  it('names the legacy sitemap URL that no longer answers', async () => {
    const light = await aircraft('ZZ888')
    await payload.delete({
      collection: 'aircraft',
      id: light?.id as number,
      overrideAccess: true,
      context: { skipRevalidation: true },
    })

    expect(failures(await reconcile(payload, vehicleChecks(FIXTURE_SCHEMA)))).toEqual([
      `${FIXTURE_SCHEMA}.vehicles: every plane row is a document in aircraft: 1 discrepancy ({"legacy_id":5})`,
      `${FIXTURE_SCHEMA}.vehicles: every URL the legacy aircraft sitemap listed names an aircraft: 1 discrepancy ({"legacy_id":5,"tail_number":"ZZ888"})`,
      `${FIXTURE_SCHEMA}: as many aircraft of each origin as the two tables have registrations: 1 discrepancy ({"origin":"vehicles-legacy","expected":2,"aircraft":1})`,
    ])
  })
})
