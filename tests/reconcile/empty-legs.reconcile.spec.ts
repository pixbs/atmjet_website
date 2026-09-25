import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { importAirports } from '../../scripts/migrate/airports'
import { importEmptyLegs } from '../../scripts/migrate/empty-legs'
import { emptyLegChecks, failures, reconcile } from '../../scripts/migrate/reconcile'
import { getTestPayload } from '../helpers/payload'
import { dropFixture, FIXTURE_SCHEMA, loadFixture } from './fixture'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }))

/**
 * Empty legs (issue #83) imported after the airports they fly between, and reconciled: the
 * same instants in UTC, the same route, price and order, every known airport linked.
 */
let payload: Payload

const leg = async (legacyId: number) => {
  const { docs } = await payload.find({
    collection: 'empty-legs',
    where: { 'provenance.legacyId': { equals: legacyId } },
    overrideAccess: true,
    depth: 1,
  })

  return docs[0]
}

beforeAll(async () => {
  payload = await getTestPayload()
  await loadFixture(payload, ['airports.sql', 'empty-legs.sql'])
  await importAirports(payload, { schema: FIXTURE_SCHEMA })
})

afterAll(async () => {
  await dropFixture(payload)
})

describe('importing the empty legs', () => {
  it('writes a leg per row, lists the code no airport answers to, and reconciles', async () => {
    const { report, unresolved } = await importEmptyLegs(payload, { schema: FIXTURE_SCHEMA })

    expect(report).toMatchObject({ read: 4, created: 4 })
    expect(unresolved).toEqual([{ leg: 3, column: 'to', icao: 'QQZZ' }])
    expect(failures(await reconcile(payload, emptyLegChecks(FIXTURE_SCHEMA)))).toEqual([])
  })

  it('keeps the instants in UTC, the order, and the aircraft the admin typed', async () => {
    expect(await leg(3)).toMatchObject({
      departureAt: '2026-10-03T18:30:00.000Z',
      arrivalAt: '2026-10-03T22:00:00.000Z',
      departureIcao: 'ZZAC',
      arrivalIcao: 'QQZZ',
      route: 'ZZAC → QQZZ',
      price: 15000,
      currency: 'USD',
      order: 3,
      aircraft: { type: 'ZZJet 6000', category: 'Heavy', company: 'Zed Air', safety: 'ARGUS Gold' },
      provenance: { origin: 'empty-legs-legacy', legacyId: 3 },
    })
    expect((await leg(3))?.arrivalAirport ?? null).toBeNull()
    expect((await leg(4))?.departureAt).toBe('2026-10-04T06:15:30.123Z')
  })

  it('links both ends to the imported airports, whatever case the code was written in', async () => {
    const second = await leg(2)

    expect(second).toMatchObject({ departureIcao: 'ZZAB', arrivalIcao: 'ZZAC' })
    expect(second?.departureAirport).toMatchObject({ icao: 'ZZAB' })
    expect(second?.arrivalAirport).toMatchObject({ icao: 'ZZAC' })
  })

  it('leaves the same legs behind when it is run again', async () => {
    const { report } = await importEmptyLegs(payload, { schema: FIXTURE_SCHEMA })

    expect(report).toMatchObject({ read: 4, skipped: 4, created: 0 })
  })

  it('names the leg whose order or time drifted', async () => {
    await payload.update({
      collection: 'empty-legs',
      id: (await leg(1))?.id as number,
      data: { order: 9 },
      overrideAccess: true,
      context: { skipRevalidation: true },
    })

    expect(failures(await reconcile(payload, emptyLegChecks(FIXTURE_SCHEMA)))).toEqual([
      `${FIXTURE_SCHEMA}.atmjet_admin__empty_legs: every leg keeps its UTC times, route, price and order: 2 discrepancies ({"found":"missing","legacy_id":1,"departure":"2026-10-01T08:00:00.000","arrival":"2026-10-01T12:00:00.000","from_icao":"ZZAA","to_icao":"ZZAE","price":9000,"order":1}, {"found":"unexpected","legacy_id":1,"departure":"2026-10-01T08:00:00.000","arrival":"2026-10-01T12:00:00.000","from_icao":"ZZAA","to_icao":"ZZAE","price":9000,"order":9})`,
    ])
  })
})
