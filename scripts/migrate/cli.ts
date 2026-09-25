/**
 * Runs an import, or the reconciliation, against the legacy schema of the database
 * `DATABASE_URL` names (`docs/adr/0002-database-migration-strategy.md` items 6, 7 and 10).
 *
 *   bun run import:legacy airports [--schema legacy] [--dry-run]
 *   bun run import:legacy reconcile [--schema legacy]
 *
 * An import can be run again at any point: rows the ledger already holds are skipped, and the
 * reconciliation exits non-zero while anything is missing.
 */
import { getPayload } from 'payload'

import config from '../../src/payload.config'
import { importAirports } from './airports'
import { airportChecks, failures, reconcile } from './reconcile'

function flag(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`)

  return index === -1 ? undefined : process.argv[index + 1]
}

const command = process.argv[2]
const schema = flag('schema') ?? 'legacy'
const dryRun = process.argv.includes('--dry-run')

if (command !== 'airports' && command !== 'reconcile') {
  console.error('Usage: bun run import:legacy airports|reconcile [--schema legacy] [--dry-run]')
  process.exit(1)
}

const payload = await getPayload({ config: await config })

if (command === 'airports') {
  const { reports, differences } = await importAirports(payload, { schema, dryRun })

  for (const { table, collection, read, created, updated, skipped } of reports)
    console.log(
      `${table} → ${collection}: ${read} read, ${created} created, ${updated} updated, ${skipped} skipped`,
    )
  for (const { icao, field, legacy, newer } of differences)
    console.log(`differs ${icao} ${field}: "${legacy}" → "${newer}" (new_airports kept)`)
  console.log(`${differences.length} values differ between the two airport tables`)
} else {
  const failed = failures(await reconcile(payload, airportChecks(schema)))

  for (const line of failed) console.error(line)
  console.log(
    failed.length === 0 ? 'reconciled: every check passes' : `${failed.length} checks fail`,
  )
  process.exit(failed.length === 0 ? 0 : 1)
}

process.exit(0)
