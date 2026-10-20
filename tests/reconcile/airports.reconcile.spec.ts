import type { Payload, Where } from 'payload'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { importAirports } from '../../scripts/migrate/airports'
import { airportChecks, failures, reconcile } from '../../scripts/migrate/reconcile'
import { getTestPayload } from '../helpers/payload'
import { dropFixture, FIXTURE_SCHEMA, loadFixture } from './fixture'

// The import writes with `skipRevalidation`, but a delete in the clean-up still reaches the hook.
vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }))

/**
 * Airports (issue #77) imported from the legacy fixture and reconciled with the checks the real
 * run uses (issue #44, `docs/adr/0002-database-migration-strategy.md` item 10).
 */
let payload: Payload

const airport = async (where: Where) => {
  const { docs } = await payload.find({
    collection: 'airports',
    where,
    locale: 'all',
    overrideAccess: true,
    depth: 0,
  })

  return docs[0] as unknown as Record<string, unknown> | undefined
}

beforeAll(async () => {
  payload = await getTestPayload()
  await loadFixture(payload, ['airports.sql'])
})

afterAll(async () => {
  await dropFixture(payload)
})

describe('importing the legacy airports', () => {
  it('writes one airport per ICAO code, plus the rows that have none, and reconciles', async () => {
    const { reports, differences } = await importAirports(payload, { schema: FIXTURE_SCHEMA })

    expect(reports.map(({ read, created, updated }) => ({ read, created, updated }))).toEqual([
      { read: 4, created: 4, updated: 0 },
      // Two of the four newer rows are airports the older table already had.
      { read: 4, created: 2, updated: 2 },
    ])
    expect(failures(await reconcile(payload, airportChecks(FIXTURE_SCHEMA)))).toEqual([])
    expect(differences).toContainEqual({
      icao: 'ZZAA',
      field: 'label_en',
      legacy: 'Alpha Intl',
      newer: 'Alpha International',
    })
  })

  it('keeps the newer name and the older position where both tables describe an airport', async () => {
    expect(await airport({ icao: { equals: 'ZZAA' } })).toMatchObject({
      name: { en: 'Alpha International', ru: 'Альфа' },
      aliases: { en: 'Alpha, Big A', ru: 'Альфа, Большая А' },
      passengersPerYear: 49837000,
      gmtOffset: '+4',
      latitude: 25.2528,
      longitude: 55.3644,
      isoCode: 'ZA',
    })
  })

  it('stores a code one way, and leaves out what it cannot read', async () => {
    const charlie = await airport({ icao: { equals: 'ZZAC' } })

    expect(charlie).toMatchObject({ iata: 'ZAC', passengersPerYear: 1200 })
    expect(charlie?.latitude ?? null).toBeNull()
    expect((await airport({ icao: { equals: 'ZZAE' } }))?.passengersPerYear ?? null).toBeNull()
    expect(await airport({ icao: { equals: 'ZZAB' } })).toMatchObject({ latitude: -33.9 })
  })

  it('keeps an airport with no ICAO code on its IATA code or its Wikidata item', async () => {
    expect(await airport({ iata: { equals: 'ZAD' } })).toMatchObject({ icao: null })
    expect(await airport({ wikidata: { equals: 'Q900006' } })).toMatchObject({
      name: { en: 'Foxtrot Heliport', ru: 'Фокстрот' },
    })
  })

  it('leaves the same airports behind when it is run again', async () => {
    const { reports } = await importAirports(payload, { schema: FIXTURE_SCHEMA })

    expect(reports.map(({ skipped, created, updated }) => ({ skipped, created, updated }))).toEqual(
      [
        { skipped: 4, created: 0, updated: 0 },
        { skipped: 4, created: 0, updated: 0 },
      ],
    )
    expect(failures(await reconcile(payload, airportChecks(FIXTURE_SCHEMA)))).toEqual([])
  })

  it('names the row whose airport went missing', async () => {
    const bravo = await airport({ icao: { equals: 'ZZAB' } })
    await payload.delete({
      collection: 'airports',
      id: bravo?.id as number,
      overrideAccess: true,
      context: { skipRevalidation: true },
    })

    expect(failures(await reconcile(payload, airportChecks(FIXTURE_SCHEMA)))).toEqual([
      `${FIXTURE_SCHEMA}.airports: every row is a document in airports: 1 discrepancy ({"legacy_id":2})`,
      `${FIXTURE_SCHEMA}: every ICAO code of both airport tables is exactly one airport: 1 discrepancy ({"icao":"ZZAB","airports":0})`,
      `${FIXTURE_SCHEMA}: every airport an empty leg flies from or to is an airport: 1 discrepancy ({"icao":"ZZAB"})`,
    ])
  })
})
