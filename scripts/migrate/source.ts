import { sql } from '@payloadcms/db-postgres'
import type { Payload } from 'payload'

import type { ImportSource } from './runner'

/**
 * Where an importer's rows come from (issue #76): the legacy schema in production, an array in
 * a test. Both are read the same way, so the runner never learns which it is holding.
 */

/** Rows already in memory: a fixture, or a table small enough to have been read in one go. */
export function rowsFrom<Row>(table: string, rows: readonly Row[]): ImportSource<Row> {
  return {
    table,
    async *rows() {
      yield* rows
    },
  }
}

export interface TableSource {
  /** `legacy` in the new project; a test points this at a schema it made itself. */
  schema: string
  table: string
  /** A column the rows can be ordered by, so paging through them is stable. */
  orderBy: string
  /** Rows per statement. Not the runner's batch size: this is how much comes back at once. */
  pageSize?: number
}

/**
 * The identifiers here come from an importer rather than from data, but they are interpolated
 * into the statement, so anything that is not a plain name is refused rather than quoted.
 */
export function quoteIdentifier(name: string): string {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name))
    throw new Error(`migrate: ${JSON.stringify(name)} is not a table, schema or column name`)

  return `"${name}"`
}

interface Drizzle {
  execute(query: ReturnType<typeof sql.raw>): Promise<{ rows?: Record<string, unknown>[] }>
}

const drizzleOf = (payload: Payload): Drizzle =>
  (payload.db as unknown as { drizzle: Drizzle }).drizzle

/**
 * A legacy table, read page by page rather than into memory: `vehicles` and `aircraft_images`
 * are the largest things this project reads, and a run that resumes reads them all again.
 */
export function tableRows<Row>(payload: Payload, source: TableSource): ImportSource<Row> {
  const { schema, table, orderBy, pageSize = 500 } = source
  const from = `${quoteIdentifier(schema)}.${quoteIdentifier(table)}`
  const order = quoteIdentifier(orderBy)

  return {
    table,
    async *rows() {
      for (let offset = 0; ; offset += pageSize) {
        const result = await drizzleOf(payload).execute(
          sql.raw(`SELECT * FROM ${from} ORDER BY ${order} LIMIT ${pageSize} OFFSET ${offset}`),
        )
        const page = (result.rows ?? []) as Row[]

        yield* page

        if (page.length < pageSize) return
      }
    },
  }
}
