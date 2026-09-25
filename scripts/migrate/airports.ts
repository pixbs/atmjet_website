import type { Payload, Where } from 'payload'

import { normaliseCode, normaliseText } from '../../src/lib/airports'
import { runImport, type ImportReport } from './runner'
import { tableRows } from './source'
import { payloadTarget, type TargetDocument } from './target'

/**
 * Airports (issue #77, `docs/adr/0002-database-migration-strategy.md` item 7): `airports` and
 * `new_airports` into the one collection, a document per ICAO code. `airports` is imported
 * first and `new_airports` second, so where both tables hold a value the newer one's is what
 * stays; what the two disagree on is returned for the run to log.
 *
 * Both tables are static reference data that no admin screen writes
 * (`docs/legacy-inventory.md` section 8), so a delta import never reorders the two.
 */

/** `airports`: every column `varchar(255) NOT NULL`, empty rather than null when unknown. */
export interface AirportsRow {
  id: number
  iata_code: string | null
  icao_code: string | null
  name_rus: string | null
  name_eng: string | null
  city_rus: string | null
  city_eng: string | null
  gmt_offset: string | null
  country_rus: string | null
  country_eng: string | null
  iso_code: string | null
  latitude: string | null
  longitude: string | null
}

/** `new_airports`: every column `text`, including the passenger count. */
export interface NewAirportsRow {
  id: number
  icao: string | null
  iata: string | null
  label_en: string | null
  label_ru: string | null
  city_en: string | null
  city_ru: string | null
  country_en: string | null
  country_ru: string | null
  passengers_per_year: string | null
  type_en: string | null
  type_ru: string | null
  alies_en: string | null
  alies_ru: string | null
  wikidata: string | null
}

type Airport = TargetDocument<'airports'>

/** Drops what a row left empty, so an update keeps the value the other table wrote. */
function present<T extends object>(fields: T): T {
  return Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined)) as T
}

/** `49 837 000`, `49,837,000` or `49837000` as a count; anything else is no count at all. */
function passengers(value: string | null): number | undefined {
  const digits = (value ?? '').replace(/[\s,'_]/g, '')

  return /^\d+(\.\d+)?$/.test(digits) ? Math.round(Number(digits)) : undefined
}

/** A decimal degree within its range, with a comma accepted as the decimal point. */
function degrees(value: string | null, limit: number): number | undefined {
  const text = (value ?? '').trim().replace(',', '.')
  const number = text === '' ? Number.NaN : Number(text)

  return Number.isFinite(number) && Math.abs(number) <= limit ? number : undefined
}

export function fromAirports(row: AirportsRow): Airport {
  return {
    data: present({
      icao: normaliseCode(row.icao_code),
      iata: normaliseCode(row.iata_code),
      name: normaliseText(row.name_eng),
      city: normaliseText(row.city_eng),
      country: normaliseText(row.country_eng),
      isoCode: normaliseCode(row.iso_code),
      gmtOffset: normaliseText(row.gmt_offset),
      latitude: degrees(row.latitude, 90),
      longitude: degrees(row.longitude, 180),
    }),
    translations: {
      ru: present({
        name: normaliseText(row.name_rus),
        city: normaliseText(row.city_rus),
        country: normaliseText(row.country_rus),
      }),
    },
  }
}

export function fromNewAirports(row: NewAirportsRow): Airport {
  return {
    data: present({
      icao: normaliseCode(row.icao),
      iata: normaliseCode(row.iata),
      name: normaliseText(row.label_en),
      city: normaliseText(row.city_en),
      country: normaliseText(row.country_en),
      aliases: normaliseText(row.alies_en),
      type: normaliseText(row.type_en),
      passengersPerYear: passengers(row.passengers_per_year),
      wikidata: normaliseText(row.wikidata),
    }),
    translations: {
      ru: present({
        name: normaliseText(row.label_ru),
        city: normaliseText(row.city_ru),
        country: normaliseText(row.country_ru),
        aliases: normaliseText(row.alies_ru),
        type: normaliseText(row.type_ru),
      }),
    },
  }
}

/**
 * The airport a row is: its ICAO code, else its IATA code on an airport with no ICAO, else its
 * Wikidata item. A row with none of the three matches nothing and stays a document of its own,
 * which the ledger keeps from being written twice.
 */
export function airportKey(data: Airport['data']): Where {
  if (data.icao) return { icao: { equals: data.icao } }
  if (data.iata) return { and: [{ icao: { exists: false } }, { iata: { equals: data.iata } }] }
  if (data.wikidata) return { wikidata: { equals: data.wikidata } }

  return { id: { equals: 0 } }
}

export interface AirportDifference {
  icao: string
  field: string
  legacy: string
  newer: string
}

/** The pairs of columns that say the same thing in the two tables. */
const SHARED: [keyof AirportsRow, keyof NewAirportsRow][] = [
  ['iata_code', 'iata'],
  ['name_eng', 'label_en'],
  ['name_rus', 'label_ru'],
  ['city_eng', 'city_en'],
  ['city_rus', 'city_ru'],
  ['country_eng', 'country_en'],
  ['country_rus', 'country_ru'],
]

/** Where an ICAO code is in both tables and they spell a fact differently; the newer one wins. */
export function airportDifferences(
  legacy: AirportsRow[],
  newer: NewAirportsRow[],
): AirportDifference[] {
  const older = new Map(legacy.map((row) => [normaliseCode(row.icao_code), row]))
  const found: AirportDifference[] = []

  for (const row of newer) {
    const icao = normaliseCode(row.icao)
    const match = icao === undefined ? undefined : older.get(icao)
    if (icao === undefined || match === undefined) continue

    for (const [old, fresh] of SHARED) {
      const before = normaliseText(match[old]) ?? ''
      const after = normaliseText(row[fresh]) ?? ''

      if (before !== '' && after !== '' && before !== after)
        found.push({ icao, field: fresh, legacy: before, newer: after })
    }
  }

  return found
}

async function read<Row>(payload: Payload, schema: string, table: string): Promise<Row[]> {
  const rows: Row[] = []

  for await (const row of tableRows<Row>(payload, { schema, table, orderBy: 'id' }).rows())
    rows.push(row)

  return rows
}

export interface AirportsImport {
  reports: ImportReport[]
  differences: AirportDifference[]
}

export async function importAirports(
  payload: Payload,
  options: { schema?: string; dryRun?: boolean; runId?: string } = {},
): Promise<AirportsImport> {
  const { schema = 'legacy', dryRun = false } = options
  // One run id for both tables, so the ledger shows them as the one import they are.
  const run = { dryRun, runId: options.runId ?? crypto.randomUUID() }
  const target = (table: string) =>
    payloadTarget(payload, { collection: 'airports', table, naturalKey: airportKey })
  const legacy = tableRows<AirportsRow>(payload, { schema, table: 'airports', orderBy: 'id' })
  const newer = tableRows<NewAirportsRow>(payload, { schema, table: 'new_airports', orderBy: 'id' })

  // Older first, so the newer table's values are the ones left standing.
  const reports = [
    await runImport(
      { source: legacy, sourceId: (row) => String(row.id), transform: fromAirports },
      target(legacy.table),
      run,
    ),
    await runImport(
      { source: newer, sourceId: (row) => String(row.id), transform: fromNewAirports },
      target(newer.table),
      run,
    ),
  ]

  return {
    reports,
    differences: airportDifferences(
      await read<AirportsRow>(payload, schema, 'airports'),
      await read<NewAirportsRow>(payload, schema, 'new_airports'),
    ),
  }
}
