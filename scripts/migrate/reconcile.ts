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

/** Every row of a legacy table has a ledger row whose document still exists. */
function everyRowImported(schema: string, table: string, collection: string): Check {
  const qualified = `${quoteIdentifier(schema)}.${quoteIdentifier(table)}`

  return {
    name: `${schema}.${table}: every row is a document in ${collection}`,
    sql: `SELECT l.id AS legacy_id FROM ${qualified} l
      LEFT JOIN migration_runs m ON m.source_key = '${schema}.${table}:' || l.id
      LEFT JOIN ${quoteIdentifier(collection)} d ON d.id::text = m.document_id
      WHERE d.id IS NULL ORDER BY l.id`,
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
