import { sql } from '@payloadcms/db-postgres'
import type { Payload } from 'payload'

import { quoteIdentifier } from './source'

/**
 * The reconciliation of `docs/adr/0002-database-migration-strategy.md` item 10 (issues #44,
 * #85): each check is a query that returns one row per discrepancy between the legacy schema
 * and what the imports wrote, so a passing check returns nothing and a failing one says which
 * rows. The same checks run on the fixture in `tests/reconcile` and on the real data.
 */
export interface Check {
  /** What is compared, as a failure names it. */
  name: string
  sql: string
}

export interface CheckResult {
  name: string
  discrepancies: Record<string, unknown>[]
}

interface Drizzle {
  execute(query: ReturnType<typeof sql.raw>): Promise<{ rows?: Record<string, unknown>[] }>
}

export async function reconcile(payload: Payload, checks: Check[]): Promise<CheckResult[]> {
  const drizzle = (payload.db as unknown as { drizzle: Drizzle }).drizzle
  const results: CheckResult[] = []

  for (const check of checks) {
    const { rows = [] } = await drizzle.execute(sql.raw(check.sql))
    results.push({ name: check.name, discrepancies: rows })
  }

  return results
}

/** One line per failed check, naming the first rows that failed it. */
export function failures(results: CheckResult[]): string[] {
  return results
    .filter((result) => result.discrepancies.length > 0)
    .map(({ name, discrepancies }) => {
      const shown = discrepancies.slice(0, 5).map((row) => JSON.stringify(row))
      const more = discrepancies.length > shown.length ? ', …' : ''

      return `${name}: ${discrepancies.length} discrepanc${discrepancies.length === 1 ? 'y' : 'ies'} (${shown.join(', ')}${more})`
    })
}

/** A code as `normaliseCode` stores it: no whitespace, upper case, empty when absent. */
const code = (column: string) => `upper(regexp_replace(coalesce(${column}, ''), '\\s', '', 'g'))`

/** Every row of a legacy table, or of the part `rows` names, has a ledger row whose document still exists. */
function everyRowImported(
  schema: string,
  table: string,
  collection: string,
  rows?: { name: string; where: string },
): Check {
  const qualified = `${quoteIdentifier(schema)}.${quoteIdentifier(table)}`

  return {
    name: `${schema}.${table}: every ${rows?.name ?? 'row'} is a document in ${collection}`,
    sql: `SELECT l.id AS legacy_id FROM ${qualified} l
      LEFT JOIN migration_runs m ON m.source_key = '${schema}.${table}:' || l.id
      LEFT JOIN ${quoteIdentifier(collection.replaceAll('-', '_'))} d ON d.id::text = m.document_id
      WHERE d.id IS NULL ${rows === undefined ? '' : `AND ${rows.where}`} ORDER BY l.id`,
  }
}

export function airportChecks(schema: string): Check[] {
  const legacy = quoteIdentifier(schema)
  const codes = `SELECT ${code('icao_code')} AS icao FROM ${legacy}.airports
    UNION SELECT ${code('icao')} FROM ${legacy}.new_airports`

  return [
    everyRowImported(schema, 'airports', 'airports'),
    everyRowImported(schema, 'new_airports', 'airports'),
    {
      name: `${schema}: every ICAO code of both airport tables is exactly one airport`,
      sql: `SELECT l.icao, count(a.id)::int AS airports FROM (${codes}) l
        LEFT JOIN airports a ON a.icao = l.icao
        WHERE l.icao <> '' GROUP BY l.icao HAVING count(a.id) <> 1 ORDER BY l.icao`,
    },
    {
      name: `${schema}: no imported airport has an ICAO code the legacy tables lack`,
      sql: `SELECT DISTINCT a.icao FROM airports a
        JOIN migration_runs m ON m.document_id = a.id::text AND m.target = 'airports'
          AND m.source_table IN ('${schema}.airports', '${schema}.new_airports')
        WHERE a.icao IS NOT NULL AND a.icao NOT IN (${codes}) ORDER BY a.icao`,
    },
    {
      name: `${schema}: every airport an empty leg flies from or to is an airport`,
      sql: `SELECT DISTINCT c.icao FROM (
          SELECT ${code('"from"')} AS icao FROM ${legacy}.atmjet_admin__empty_legs
          UNION SELECT ${code('"to"')} FROM ${legacy}.atmjet_admin__empty_legs
        ) c WHERE NOT EXISTS (SELECT 1 FROM airports a WHERE a.icao = c.icao) ORDER BY c.icao`,
    },
  ]
}

export function aircraftChecks(schema: string): Check[] {
  const legacy = quoteIdentifier(schema)
  const imported = `SELECT l.id AS legacy_id, m.document_id FROM ${legacy}.aircrafts l
    JOIN migration_runs m ON m.source_key = '${schema}.aircrafts:' || l.id`
  const legacyImages = `SELECT aircraft_id AS legacy_id,
      row_number() OVER (PARTITION BY aircraft_id ORDER BY id)::int AS position,
      type::text AS type, trim(url) AS url
    FROM ${legacy}.aircraft_images`
  const importedImages = `SELECT i.legacy_id,
      row_number() OVER (PARTITION BY i.legacy_id ORDER BY p._order)::int AS position,
      p.type::text AS type, p.external_url AS url
    FROM (${imported}) i JOIN aircraft_images p ON p._parent_id::text = i.document_id`

  return [
    everyRowImported(schema, 'aircrafts', 'aircraft'),
    {
      name: `${schema}.aircrafts: every catalogue slug is an aircraft's slug`,
      sql: `SELECT l.id AS legacy_id, l.slug FROM ${legacy}.aircrafts l
        WHERE NOT EXISTS (SELECT 1 FROM aircraft a WHERE a.slug = l.slug) ORDER BY l.id`,
    },
    {
      name: `${schema}.aircraft_images: every aircraft has as many images as the catalogue gave it`,
      sql: `SELECT i.legacy_id, coalesce(l.images, 0)::int AS legacy_images, count(p.id)::int AS images
        FROM (${imported}) i
        LEFT JOIN (SELECT aircraft_id, count(*) AS images FROM ${legacy}.aircraft_images GROUP BY aircraft_id) l
          ON l.aircraft_id = i.legacy_id
        LEFT JOIN aircraft_images p ON p._parent_id::text = i.document_id
        GROUP BY i.legacy_id, l.images HAVING count(p.id) <> coalesce(l.images, 0) ORDER BY i.legacy_id`,
    },
    {
      name: `${schema}.aircraft_images: every image is in the place and role the catalogue gave it`,
      sql: `(SELECT 'missing' AS found, * FROM (${legacyImages} EXCEPT ${importedImages}) a)
        UNION ALL (SELECT 'unexpected', * FROM (${importedImages} EXCEPT ${legacyImages}) b)
        ORDER BY legacy_id, position`,
    },
  ]
}

/** A registration as `canonicalRegistration` stores it. */
const registration = (column: string) => `upper(regexp_replace(${column}, '[\\s-]', '', 'g'))`

export function vehicleChecks(schema: string): Check[] {
  const legacy = quoteIdentifier(schema)
  const plane = `trim(coalesce(l.tail_number, '')) <> ''`
  const planes = `SELECT DISTINCT ${registration('l.tail_number')} AS reg FROM ${legacy}.vehicles l WHERE ${plane}`
  const catalogue = `SELECT DISTINCT ${registration(`coalesce(nullif(trim(registration_number), ''), slug)`)} AS reg
    FROM ${legacy}.aircrafts`
  const documents = (table: string, origin: string) => `SELECT count(DISTINCT a.id) FROM aircraft a
    JOIN migration_runs m ON m.document_id = a.id::text AND m.source_table = '${schema}.${table}'
    WHERE a.provenance_origin = '${origin}'`

  return [
    everyRowImported(schema, 'vehicles', 'aircraft', { name: 'plane row', where: plane }),
    {
      name: 'every registration is one aircraft',
      sql: `SELECT registration, count(*)::int AS aircraft FROM aircraft
        WHERE registration IS NOT NULL GROUP BY registration HAVING count(*) > 1`,
    },
    {
      name: `${schema}.vehicles: every URL the legacy aircraft sitemap listed names an aircraft`,
      sql: `SELECT l.id AS legacy_id, l.tail_number FROM ${legacy}.vehicles l WHERE ${plane}
        AND NOT EXISTS (SELECT 1 FROM aircraft a
          WHERE a.registration = ${registration('l.tail_number')} OR a.slug = trim(l.tail_number))
        ORDER BY l.id`,
    },
    {
      name: `${schema}.vehicles: every plane merged into another row's aircraft is in its mergedFrom`,
      sql: `SELECT l.id AS legacy_id, a.id AS aircraft FROM ${legacy}.vehicles l
        JOIN migration_runs m ON m.source_key = '${schema}.vehicles:' || l.id
        JOIN aircraft a ON a.id::text = m.document_id
        WHERE a.provenance_legacy_vehicle_id IS DISTINCT FROM l.id
          AND NOT EXISTS (SELECT 1 FROM aircraft_provenance_merged_from f
            WHERE f._parent_id = a.id AND f."table" = 'vehicles' AND f.legacy_id = l.id)
        ORDER BY l.id`,
    },
    {
      name: `${schema}: as many aircraft of each origin as the two tables have registrations`,
      sql: `SELECT origin, expected::int, aircraft::int FROM (
          SELECT 'aircrafts-catalog' AS origin, (SELECT count(*) FROM (${catalogue}) c) AS expected,
            (${documents('aircrafts', 'aircrafts-catalog')}) AS aircraft
          UNION ALL SELECT 'vehicles-legacy',
            (SELECT count(*) FROM (${planes}) p WHERE p.reg NOT IN (SELECT reg FROM (${catalogue}) c)),
            (${documents('vehicles', 'vehicles-legacy')})
        ) o WHERE expected <> aircraft`,
    },
  ]
}

/** Every photo of a yacht table's array column is in the place it had, in both directions. */
function photosInPlace(schema: string, table: string, column: string): Check {
  const legacy = `${quoteIdentifier(schema)}.${quoteIdentifier(table)}`
  const photos = quoteIdentifier(column)
  const legacyPhotos = `SELECT l.id AS legacy_id,
      row_number() OVER (PARTITION BY l.id ORDER BY p.position)::int AS position, trim(p.url) AS url
    FROM ${legacy} l, unnest(l.${photos}) WITH ORDINALITY AS p(url, position)
    WHERE trim(p.url) <> ''`
  const importedPhotos = `SELECT l.id AS legacy_id,
      row_number() OVER (PARTITION BY l.id ORDER BY p._order)::int AS position, p.external_url AS url
    FROM ${legacy} l
    JOIN migration_runs m ON m.source_key = '${schema}.${table}:' || l.id
    JOIN yachts_photos p ON p._parent_id::text = m.document_id`

  return {
    name: `${schema}.${table}: every photo is in the place the ${column} array gave it`,
    sql: `(SELECT 'missing' AS found, * FROM (${legacyPhotos} EXCEPT ${importedPhotos}) a)
      UNION ALL (SELECT 'unexpected', * FROM (${importedPhotos} EXCEPT ${legacyPhotos}) b)
      ORDER BY legacy_id, position`,
  }
}

export function charterChecks(schema: string): Check[] {
  const legacy = quoteIdentifier(schema)
  const imported = `SELECT l.*, y.id AS yacht, y.contact_id AS contact_doc, y.captain_id AS captain_doc
    FROM ${legacy}.new_yachts l
    JOIN migration_runs m ON m.source_key = '${schema}.new_yachts:' || l.id
    JOIN yachts y ON y.id::text = m.document_id`
  const person = (column: string, field: string) => `SELECT i.id AS legacy_id, '${field}' AS field,
      i.${column} AS legacy_contact, c.provenance_legacy_contact_id::int AS contact
    FROM (${imported}) i LEFT JOIN contacts c ON c.id = i.${field}_doc
    WHERE (CASE WHEN i.${column} IN (SELECT id FROM ${legacy}.contact) THEN i.${column} END)
      IS DISTINCT FROM c.provenance_legacy_contact_id`

  return [
    everyRowImported(schema, 'contact', 'contacts'),
    everyRowImported(schema, 'new_yachts', 'yachts'),
    photosInPlace(schema, 'new_yachts', 'photos'),
    {
      name: `${schema}.new_yachts: every contact and captain that exists is the one the row named`,
      sql: `${person('contact_id', 'contact')} UNION ALL ${person('captain_id', 'captain')}
        ORDER BY legacy_id, field`,
    },
  ]
}

export function saleChecks(schema: string): Check[] {
  return [everyRowImported(schema, 'yachts', 'yachts'), photosInPlace(schema, 'yachts', 'pictures')]
}

export function emptyLegChecks(schema: string): Check[] {
  const legacy = quoteIdentifier(schema)
  const instant = (column: string) =>
    `to_char(${column} AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS')`
  const legacyLegs = `SELECT l.id AS legacy_id, ${instant('l."start"')} AS departure, ${instant('l."end"')} AS arrival,
      ${code('l."from"')} AS from_icao, ${code('l."to"')} AS to_icao, l.price, l."order"
    FROM ${legacy}.atmjet_admin__empty_legs l`
  const importedLegs = `SELECT l.id AS legacy_id, ${instant('e.departure_at')}, ${instant('e.arrival_at')},
      e.departure_icao, e.arrival_icao, e.price::int, e."order"::int
    FROM ${legacy}.atmjet_admin__empty_legs l
    JOIN migration_runs m ON m.source_key = '${schema}.atmjet_admin__empty_legs:' || l.id
    JOIN empty_legs e ON e.id::text = m.document_id`

  return [
    everyRowImported(schema, 'atmjet_admin__empty_legs', 'empty-legs'),
    {
      name: `${schema}.atmjet_admin__empty_legs: every leg keeps its UTC times, route, price and order`,
      sql: `(SELECT 'missing' AS found, * FROM (${legacyLegs} EXCEPT ${importedLegs}) a)
        UNION ALL (SELECT 'unexpected', * FROM (${importedLegs} EXCEPT ${legacyLegs}) b)
        ORDER BY legacy_id`,
    },
    {
      name: `${schema}.atmjet_admin__empty_legs: every leg whose code names an airport is linked to it`,
      sql: `SELECT l.id AS legacy_id, e.departure_icao, e.arrival_icao
        FROM ${legacy}.atmjet_admin__empty_legs l
        JOIN migration_runs m ON m.source_key = '${schema}.atmjet_admin__empty_legs:' || l.id
        JOIN empty_legs e ON e.id::text = m.document_id
        WHERE (e.departure_airport_id IS NULL AND EXISTS (SELECT 1 FROM airports a WHERE a.icao = e.departure_icao))
           OR (e.arrival_airport_id IS NULL AND EXISTS (SELECT 1 FROM airports a WHERE a.icao = e.arrival_icao))
        ORDER BY l.id`,
    },
  ]
}
