import type { Payload } from 'payload'
import { sql } from '@payloadcms/db-postgres'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { importCatalogue } from '../../scripts/migrate/aircraft'
import { importAirports } from '../../scripts/migrate/airports'
import { importEmptyLegs } from '../../scripts/migrate/empty-legs'
import {
  aircraftChecks,
  airportChecks,
  charterChecks,
  emptyLegChecks,
  failures,
  reconcile,
  saleChecks,
  vehicleChecks,
} from '../../scripts/migrate/reconcile'
import { importVehicles } from '../../scripts/migrate/vehicles'
import { importCharterYachts, importSaleYachts } from '../../scripts/migrate/yachts'
import { getTestPayload } from '../helpers/payload'
import { dropFixture, FIXTURE_SCHEMA, loadFixture } from './fixture'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }))

/**
 * The whole legacy schema in miniature (issue #44): all twelve tables, every importer in the
 * order `bun run import:legacy` runs them, and every check E5.13 runs on the real data. The
 * other specs pin one importer each; this one pins that they compose, and that the imports
 * leave the legacy tables exactly as they found them.
 */
let payload: Payload

const TABLES = [
  'aircraft_images',
  'aircrafts',
  'airports',
  'atmjet_admin__empty_legs',
  'atmjet_admin__users',
  'city_list',
  'contact',
  'migration_status',
  'new_airports',
  'new_yachts',
  'vehicles',
  'yachts',
]

const checks = () => [
  ...airportChecks(FIXTURE_SCHEMA),
  ...aircraftChecks(FIXTURE_SCHEMA),
  ...vehicleChecks(FIXTURE_SCHEMA),
  ...charterChecks(FIXTURE_SCHEMA),
  ...saleChecks(FIXTURE_SCHEMA),
  ...emptyLegChecks(FIXTURE_SCHEMA),
]

/** Every legacy table as one checksum of its rows, the way the snapshot runbook takes them. */
const checksums = async () => {
  const { rows } = await (
    payload.db as unknown as {
      drizzle: { execute(q: unknown): Promise<{ rows: { name: string; sum: string }[] }> }
    }
  ).drizzle.execute(
    sql.raw(
      TABLES.map(
        (table) =>
          `SELECT '${table}' AS name, md5(coalesce(string_agg(t::text, '|' ORDER BY t.id), '')) AS sum FROM "${FIXTURE_SCHEMA}"."${table}" t`,
      ).join(' UNION ALL '),
    ),
  )

  return Object.fromEntries(rows.map((row) => [row.name, row.sum]))
}

let before: Record<string, string>

beforeAll(async () => {
  payload = await getTestPayload()
  // Not `empty-legs.sql`: its leg to an airport no table has is there to fail the airport check.
  await loadFixture(payload, [
    'airports.sql',
    'aircraft.sql',
    'vehicles.sql',
    'charter.sql',
    'sale.sql',
    'untouched.sql',
  ])
  before = await checksums()
})

afterAll(async () => {
  await dropFixture(payload)
})

describe('the whole legacy schema', () => {
  it('has all twelve tables of the legacy database', () => {
    expect(Object.keys(before).sort()).toEqual(TABLES)
  })

  it('imports in the order of the runbook and passes every check', async () => {
    await importAirports(payload, { schema: FIXTURE_SCHEMA })
    await importCatalogue(payload, { schema: FIXTURE_SCHEMA })
    await importVehicles(payload, { schema: FIXTURE_SCHEMA })
    await importCharterYachts(payload, { schema: FIXTURE_SCHEMA })
    await importSaleYachts(payload, { schema: FIXTURE_SCHEMA })
    await importEmptyLegs(payload, { schema: FIXTURE_SCHEMA })

    expect(failures(await reconcile(payload, checks()))).toEqual([])
  })

  it('leaves every legacy table exactly as it found it', async () => {
    expect(await checksums()).toEqual(before)
  })

  it('fails the count check, with the row named, when a legacy row is dropped from an import', async () => {
    const { docs } = await payload.find({
      collection: 'contacts',
      where: { 'provenance.legacyContactId': { equals: 3 } },
      overrideAccess: true,
      depth: 0,
    })
    await payload.delete({
      collection: 'contacts',
      id: docs[0]?.id as number,
      overrideAccess: true,
    })

    expect(failures(await reconcile(payload, checks()))).toEqual([
      `${FIXTURE_SCHEMA}.contact: every row is a document in contacts: 1 discrepancy ({"legacy_id":3})`,
      `${FIXTURE_SCHEMA}.new_yachts: every contact and captain that exists is the one the row named: 1 discrepancy ({"legacy_id":1,"field":"captain","legacy_contact":3,"contact":null})`,
    ])
  })
})
