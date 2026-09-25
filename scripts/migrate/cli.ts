/**
 * Runs an import, or the reconciliation, against the legacy schema of the database
 * `DATABASE_URL` names (`docs/adr/0002-database-migration-strategy.md` items 6, 7 and 10).
 *
 *   bun run import:legacy airports [--schema legacy] [--dry-run]
 *   bun run import:legacy aircraft [--schema legacy] [--dry-run]   (after airports)
 *   bun run import:legacy vehicles [--schema legacy] [--dry-run]   (after aircraft)
 *   bun run import:legacy yachts [--schema legacy] [--dry-run]     (contacts, then charter yachts)
 *   bun run import:legacy reconcile [--schema legacy]
 *
 * An import can be run again at any point: rows the ledger already holds are skipped, and the
 * reconciliation exits non-zero while anything is missing.
 */
import { getPayload } from 'payload'

import config from '../../src/payload.config'
import { importCatalogue } from './aircraft'
import { importAirports } from './airports'
import {
  aircraftChecks,
  airportChecks,
  charterChecks,
  failures,
  reconcile,
  vehicleChecks,
} from './reconcile'
import type { ImportReport } from './runner'
import { importVehicles } from './vehicles'
import { importCharterYachts } from './yachts'

function flag(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`)

  return index === -1 ? undefined : process.argv[index + 1]
}

const command = process.argv[2]
const schema = flag('schema') ?? 'legacy'
const dryRun = process.argv.includes('--dry-run')

const COMMANDS = ['airports', 'aircraft', 'vehicles', 'yachts', 'reconcile']

if (command === undefined || !COMMANDS.includes(command)) {
  console.error(`Usage: bun run import:legacy ${COMMANDS.join('|')} [--schema legacy] [--dry-run]`)
  process.exit(1)
}

const report = ({ table, collection, read, created, updated, skipped }: ImportReport) =>
  console.log(
    `${table} → ${collection}: ${read} read, ${created} created, ${updated} updated, ${skipped} skipped`,
  )

const payload = await getPayload({ config: await config })

if (command === 'airports') {
  const { reports, differences } = await importAirports(payload, { schema, dryRun })

  reports.forEach(report)
  for (const { icao, field, legacy, newer } of differences)
    console.log(`differs ${icao} ${field}: "${legacy}" → "${newer}" (new_airports kept)`)
  console.log(`${differences.length} values differ between the two airport tables`)
} else if (command === 'aircraft') {
  report(await importCatalogue(payload, { schema, dryRun }))
} else if (command === 'vehicles') {
  report(await importVehicles(payload, { schema, dryRun }))
} else if (command === 'yachts') {
  const { reports, orphans } = await importCharterYachts(payload, { schema, dryRun })

  reports.forEach(report)
  for (const { yacht, column, contact } of orphans)
    console.log(`orphan new_yachts ${yacht} ${column} ${contact}: no such contact, left empty`)
  console.log(`${orphans.length} contact references name no contact`)
} else {
  const checks = [
    ...airportChecks(schema),
    ...aircraftChecks(schema),
    ...vehicleChecks(schema),
    ...charterChecks(schema),
  ]
  const failed = failures(await reconcile(payload, checks))

  for (const line of failed) console.error(line)
  console.log(
    failed.length === 0 ? 'reconciled: every check passes' : `${failed.length} checks fail`,
  )
  process.exit(failed.length === 0 ? 0 : 1)
}

process.exit(0)
