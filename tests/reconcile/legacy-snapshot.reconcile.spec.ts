import type { Payload } from 'payload'
import { sql } from '@payloadcms/db-postgres'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { getTestPayload } from '../helpers/payload'
import { dropFixture, FIXTURE_SCHEMA, loadFixture } from './fixture'

/**
 * The smoke test of issue #74: the `legacy` schema the restore left in the database holds the
 * row counts `scripts/db/legacy-checksums.sh` recorded in the freeze window of issue #73. A
 * database without that schema (CI, a fresh local one) stands the fixture in for it, against
 * the counts the same script recorded for the fixture, so the comparison runs everywhere.
 */
const TABLES = ['vehicles', 'aircrafts']

const RECORDED: Record<string, string> = {
  legacy: 'docs/runbooks/checksums/legacy-checksums.before.tsv',
  [FIXTURE_SCHEMA]: 'tests/reconcile/fixture/checksums.tsv',
}

let payload: Payload
let schema: string

const execute = <Row>(statement: string) =>
  (
    payload.db as unknown as { drizzle: { execute(q: unknown): Promise<{ rows: Row[] }> } }
  ).drizzle.execute(sql.raw(statement))

/** Table to row count, read from the TSV the checksum script prints: schema, table, count, md5. */
async function recorded(file: string): Promise<Record<string, number>> {
  const text = await readFile(path.resolve(import.meta.dirname, '../..', file), 'utf8')
  return Object.fromEntries(
    text
      .trim()
      .split('\n')
      .map((line) => line.split('\t'))
      .map(([, table, count]) => [table, Number(count)]),
  )
}

async function counted(): Promise<Record<string, number>> {
  const { rows } = await execute<{ name: string; count: string }>(
    TABLES.map(
      (table) => `SELECT '${table}' AS name, count(*)::text AS count FROM "${schema}"."${table}"`,
    ).join(' UNION ALL '),
  )
  return Object.fromEntries(rows.map(({ name, count }) => [name, Number(count)]))
}

const pick = (counts: Record<string, number>) =>
  Object.fromEntries(TABLES.map((table) => [table, counts[table]]))

beforeAll(async () => {
  payload = await getTestPayload()
  const { rows } = await execute<{ restored: boolean }>(
    "SELECT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'legacy') AS restored",
  )
  schema = rows[0]?.restored ? 'legacy' : FIXTURE_SCHEMA
  if (schema === FIXTURE_SCHEMA) await loadFixture(payload, ['vehicles.sql', 'aircraft.sql'])
})

afterAll(async () => {
  if (schema === FIXTURE_SCHEMA) await dropFixture(payload)
})

describe('the legacy schema after the restore', () => {
  it('holds the row counts recorded in the freeze window for vehicles and aircrafts', async () => {
    const expected = pick(await recorded(RECORDED[schema] as string))

    expect(Object.values(expected).every((count) => Number.isInteger(count) && count > 0)).toBe(
      true,
    )
    expect(pick(await counted())).toEqual(expected)
  })
})
