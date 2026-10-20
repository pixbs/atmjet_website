import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { importCatalogue } from '../../scripts/migrate/aircraft'
import { importAirports } from '../../scripts/migrate/airports'
import { aircraftChecks, failures, reconcile } from '../../scripts/migrate/reconcile'
import { getTestPayload } from '../helpers/payload'
import { dropFixture, FIXTURE_SCHEMA, loadFixture } from './fixture'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }))

/**
 * The aircraft catalogue (issue #78) imported from the legacy fixture after the airports it is
 * based at, and reconciled: one document per row, every image in its place and role.
 */
let payload: Payload

const aircraft = async (slug: string) => {
  const { docs } = await payload.find({
    collection: 'aircraft',
    where: { slug: { equals: slug } },
    overrideAccess: true,
    depth: 0,
  })

  return docs[0]
}

beforeAll(async () => {
  payload = await getTestPayload()
  await loadFixture(payload, ['airports.sql', 'aircraft.sql'])
  await importAirports(payload, { schema: FIXTURE_SCHEMA })
})

afterAll(async () => {
  await dropFixture(payload)
})

describe('importing the aircraft catalogue', () => {
  it('writes a document per catalogue row and reconciles', async () => {
    const report = await importCatalogue(payload, { schema: FIXTURE_SCHEMA })

    expect(report).toMatchObject({ read: 3, created: 3, updated: 0 })
    expect(failures(await reconcile(payload, aircraftChecks(FIXTURE_SCHEMA)))).toEqual([])
  })

  it('keeps the slug, the registration as written and the numbers as the legacy site showed them', async () => {
    const jet = await aircraft('zzjet-zz-001')

    expect(jet).toMatchObject({
      registrationDisplay: 'ZZ-001',
      registration: 'ZZ001',
      offerings: ['charter'],
      type: { name: 'ZZJet 6000', slug: 'zzjet-6000', category: 'Heavy jet' },
      specification: {
        passengers: 14,
        typePassengers: 19,
        rangeMaximum: 12964,
        speedTypical: 904.5,
        cabinHeight: 1.85,
        cabinLength: 13.97,
        cabinWidth: 2.49,
        yearOfProduction: 2016,
      },
      view360Url: 'https://example.test/360/zz-001',
      operator: { companyName: 'Zed Air', technicalOperator: 'Zed Aviation' },
      provenance: { origin: 'aircrafts-catalog', legacyAircraftId: 1, legacySlug: 'zzjet-zz-001' },
    })
    expect(jet?.images?.map(({ type, externalUrl }) => [type, externalUrl])).toEqual([
      ['exterior', 'https://images.example.test/zz-001/exterior.jpg'],
      ['cabin', 'https://images.example.test/zz-001/cabin.jpg'],
      ['cockpit', 'https://images.example.test/zz-001/cockpit.jpg'],
    ])
  })

  it('bases an aircraft at the imported airport, and keeps a code no airport answers to', async () => {
    const { docs } = await payload.find({
      collection: 'airports',
      where: { icao: { equals: 'ZZAA' } },
      overrideAccess: true,
      depth: 0,
    })

    expect((await aircraft('zzjet-zz-001'))?.baseAirport).toBe(docs[0]?.id)
    expect(await aircraft('zzprop-zz002')).toMatchObject({
      offerings: ['sale', 'cargo'],
      legacyAttributes: { airport_icao: 'QQZZ' },
    })
    expect((await aircraft('zzprop-zz002'))?.baseAirport ?? null).toBeNull()
  })

  it('leaves the same aircraft behind when it is run again', async () => {
    const report = await importCatalogue(payload, { schema: FIXTURE_SCHEMA })

    expect(report).toMatchObject({ read: 3, skipped: 3, created: 0, updated: 0 })
  })

  it('names the aircraft whose images went out of order', async () => {
    const jet = await aircraft('zzjet-zz-001')
    await payload.update({
      collection: 'aircraft',
      id: jet?.id as number,
      data: { images: [...(jet?.images ?? [])].reverse().slice(1) },
      overrideAccess: true,
      context: { skipRevalidation: true },
    })

    expect(failures(await reconcile(payload, aircraftChecks(FIXTURE_SCHEMA)))).toEqual([
      `${FIXTURE_SCHEMA}.aircraft_images: every aircraft has as many images as the catalogue gave it: 1 discrepancy ({"legacy_id":1,"legacy_images":3,"images":2})`,
      `${FIXTURE_SCHEMA}.aircraft_images: every image is in the place and role the catalogue gave it: 5 discrepancies ({"found":"missing","legacy_id":1,"position":1,"type":"exterior","url":"https://images.example.test/zz-001/exterior.jpg"}, {"found":"unexpected","legacy_id":1,"position":1,"type":"cabin","url":"https://images.example.test/zz-001/cabin.jpg"}, {"found":"missing","legacy_id":1,"position":2,"type":"cabin","url":"https://images.example.test/zz-001/cabin.jpg"}, {"found":"unexpected","legacy_id":1,"position":2,"type":"exterior","url":"https://images.example.test/zz-001/exterior.jpg"}, {"found":"missing","legacy_id":1,"position":3,"type":"cockpit","url":"https://images.example.test/zz-001/cockpit.jpg"})`,
    ])
  })
})
