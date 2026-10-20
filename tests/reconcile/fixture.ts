import { sql } from '@payloadcms/db-postgres'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { Payload } from 'payload'

/**
 * The legacy schema in miniature (issue #44): the tables of `docs/legacy-inventory.md` section 8
 * with a handful of anonymised rows, loaded under a schema of its own so the importers read it
 * exactly as they read `legacy`. Each importer's slice adds the tables it reads.
 */
export const FIXTURE_SCHEMA = 'legacy_fixture'

interface Drizzle {
  execute(query: ReturnType<typeof sql.raw>): Promise<unknown>
}

const execute = (payload: Payload, statement: string) =>
  (payload.db as unknown as { drizzle: Drizzle }).drizzle.execute(sql.raw(statement))

export async function loadFixture(payload: Payload, files: string[]): Promise<void> {
  await dropFixture(payload)
  await execute(payload, `CREATE SCHEMA "${FIXTURE_SCHEMA}"`)

  for (const file of files) {
    const text = await readFile(path.resolve(import.meta.dirname, 'fixture', file), 'utf8')
    await execute(payload, text.replaceAll('{{schema}}', `"${FIXTURE_SCHEMA}"`))
  }
}

/**
 * Removes the fixture, every document an import of it wrote and the ledger rows that say so, so
 * the test database is left as the seed made it.
 */
export async function dropFixture(payload: Payload): Promise<void> {
  const { docs } = await payload.find({
    collection: 'migration-runs',
    where: { sourceTable: { like: `${FIXTURE_SCHEMA}.` } },
    pagination: false,
    overrideAccess: true,
    depth: 0,
  })

  for (const { target, documentId } of docs)
    await payload
      .delete({
        collection: target as 'airports',
        id: documentId,
        overrideAccess: true,
        context: { skipRevalidation: true },
      })
      .catch(() => undefined)

  await payload.delete({
    collection: 'migration-runs',
    where: { sourceTable: { like: `${FIXTURE_SCHEMA}.` } },
    overrideAccess: true,
  })
  await execute(payload, `DROP SCHEMA IF EXISTS "${FIXTURE_SCHEMA}" CASCADE`)
}
