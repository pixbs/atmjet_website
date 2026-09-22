import { sql } from '@payloadcms/db-postgres'
import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { runImport, type RunContext } from '../../scripts/migrate/runner'
import { rowsFrom, tableRows } from '../../scripts/migrate/source'
import { payloadTarget } from '../../scripts/migrate/target'
import { createAdmin, createUser } from '../factories'
import { createRegistry, uniqueSuffix, type TestRegistry } from '../helpers/payload'

// The import writes with `skipRevalidation`, but the airport this suite plants by hand does not,
// and dropping a cache tag needs a request scope the tier has not got.
const revalidateTag = vi.hoisted(() => vi.fn())
const revalidatePath = vi.hoisted(() => vi.fn())
vi.mock('next/cache', () => ({ revalidatePath, revalidateTag }))

/**
 * The import framework against a real database (issue #76,
 * `docs/adr/0002-database-migration-strategy.md` section 6). The unit suite pins the runner's
 * arithmetic; this one pins what the Payload end of it does: idempotence by natural key, a
 * ledger a second run reads, a chunk that rolls back whole, and a legacy table read page by
 * page.
 *
 * Every worker gets codes and a table of its own, because the tier shares one database.
 */
let registry: TestRegistry
let payload: Payload

const MARK = uniqueSuffix()
  .replace(/[^a-z0-9]/gi, '')
  .toUpperCase()
  .slice(-8)
const SOURCE_TABLE = `airports_${MARK}`
const FIXTURE_TABLE = `migrate_fixture_${MARK.toLowerCase()}`

interface Row {
  id: number
  code: string
  city: string
}

const rows = (count: number): Row[] =>
  Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    code: `${MARK}${index + 1}`,
    city: `City ${index + 1}`,
  }))

const importSpec = (source: Row[], passengers = 1000) => ({
  source: rowsFrom(SOURCE_TABLE, source),
  sourceId: (row: Row) => String(row.id),
  transform: (row: Row, run: RunContext) => ({
    icao: row.code,
    city: row.city,
    passengersPerYear: passengers,
    // What the aircraft provenance group holds for real (ADR-0002 section 8); an airport has
    // no such group, so the run id is only carried by the ledger here.
    wikidata: run.runId,
  }),
})

const target = () =>
  payloadTarget(payload, {
    collection: 'airports',
    table: SOURCE_TABLE,
    naturalKey: (doc) => ({ icao: { equals: doc.icao } }),
  })

const imported = async () => {
  const { docs } = await payload.find({
    collection: 'airports',
    where: { icao: { like: MARK } },
    pagination: false,
    overrideAccess: true,
    depth: 0,
  })

  return docs
}

const ledger = async () => {
  const { docs } = await payload.find({
    collection: 'migration-runs',
    where: { sourceTable: { equals: SOURCE_TABLE } },
    pagination: false,
    overrideAccess: true,
    depth: 0,
  })

  return docs
}

const clear = async () => {
  await payload.delete({
    collection: 'airports',
    where: { icao: { like: MARK } },
    overrideAccess: true,
    context: { skipRevalidation: true },
  })
  await payload.delete({
    collection: 'migration-runs',
    where: { sourceTable: { equals: SOURCE_TABLE } },
    overrideAccess: true,
  })
}

beforeAll(async () => {
  registry = await createRegistry()
  payload = registry.payload
})

afterAll(async () => {
  await clear()
  await registry.cleanup()
})

describe('importing a fixture', () => {
  it('writes a document and a ledger row for every source row', async () => {
    await clear()

    const report = await runImport(importSpec(rows(3)), target(), { batchSize: 2 })

    expect(report).toMatchObject({ read: 3, created: 3, updated: 0, skipped: 0 })
    expect(await imported()).toHaveLength(3)
    expect((await ledger()).map((row) => row.sourceKey).sort()).toEqual([
      `${SOURCE_TABLE}:1`,
      `${SOURCE_TABLE}:2`,
      `${SOURCE_TABLE}:3`,
    ])
  })

  it('leaves the same documents behind when it is run a second time', async () => {
    await clear()

    await runImport(importSpec(rows(3)), target())
    const again = await runImport(importSpec(rows(3)), target())

    expect(again).toMatchObject({ read: 3, skipped: 3, created: 0, updated: 0 })
    expect(await imported()).toHaveLength(3)
    expect(await ledger()).toHaveLength(3)
  })

  it('carries on where an interrupted run stopped', async () => {
    await clear()

    await runImport(importSpec(rows(2)), target())
    const rest = await runImport(importSpec(rows(5)), target())

    expect(rest).toMatchObject({ read: 5, skipped: 2, created: 3 })
    expect(await imported()).toHaveLength(5)
  })

  it('updates the document already under that natural key rather than adding a second', async () => {
    await clear()
    const planted = await registry.create('airports', { icao: `${MARK}1`, city: 'Planted' })

    const report = await runImport(importSpec(rows(1)), target())
    const [airport] = await imported()

    expect(report).toMatchObject({ created: 0, updated: 1 })
    expect(airport?.id).toBe(planted.id)
    expect(airport?.city).toBe('City 1')
  })
})

describe('a chunk that fails', () => {
  it('leaves behind neither the rows before it nor a ledger that claims them', async () => {
    await clear()

    // The second row is refused by the collection (`passengersPerYear` has a minimum), and the
    // first is written before it in the same transaction.
    await expect(runImport(importSpec(rows(2), -1), target())).rejects.toThrow()

    expect(await imported()).toEqual([])
    expect(await ledger()).toEqual([])
  })
})

describe('a dry run', () => {
  it('says what it would create and writes neither documents nor ledger rows', async () => {
    await clear()

    const report = await runImport(importSpec(rows(3)), target(), { dryRun: true })

    expect(report).toMatchObject({ read: 3, created: 3, dryRun: true })
    expect(await imported()).toEqual([])
    expect(await ledger()).toEqual([])
  })
})

describe('reading a table page by page', () => {
  const execute = (statement: string) =>
    (
      payload.db as unknown as { drizzle: { execute(query: unknown): Promise<unknown> } }
    ).drizzle.execute(sql.raw(statement))

  beforeAll(async () => {
    await execute(`DROP TABLE IF EXISTS "${FIXTURE_TABLE}"`)
    await execute(`CREATE TABLE "${FIXTURE_TABLE}" ("id" integer PRIMARY KEY, "name" text)`)
    await execute(
      `INSERT INTO "${FIXTURE_TABLE}" ("id", "name") SELECT i, 'row ' || i FROM generate_series(1, 7) AS i`,
    )
  })

  afterAll(async () => {
    await execute(`DROP TABLE IF EXISTS "${FIXTURE_TABLE}"`)
  })

  it('reads every row in order, whatever the page size', async () => {
    const source = tableRows<{ id: number; name: string }>(payload, {
      schema: 'public',
      table: FIXTURE_TABLE,
      orderBy: 'id',
      pageSize: 3,
    })
    const read: number[] = []

    for await (const row of source.rows()) read.push(row.id)

    expect(read).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('stops at the end when the last page is exactly full', async () => {
    const source = tableRows<{ id: number }>(payload, {
      schema: 'public',
      table: FIXTURE_TABLE,
      orderBy: 'id',
      pageSize: 7,
    })
    const read: number[] = []

    for await (const row of source.rows()) read.push(row.id)

    expect(read).toHaveLength(7)
  })
})

describe('access to the ledger', () => {
  const entry = (sourceId: string) => ({
    sourceKey: `${SOURCE_TABLE}:${sourceId}`,
    sourceTable: SOURCE_TABLE,
    sourceId,
    target: 'airports',
    documentId: '1',
    action: 'created' as const,
    runId: 'access',
  })

  it('tells nobody without a session what the legacy tables were called', async () => {
    await payload.create({ collection: 'migration-runs', data: entry('900'), overrideAccess: true })

    await expect(
      payload.find({ collection: 'migration-runs', overrideAccess: false }),
    ).rejects.toThrow()
    await expect(
      payload.create({ collection: 'migration-runs', data: entry('901'), overrideAccess: false }),
    ).rejects.toThrow()
  })

  it('is closed to an editor too: an import is run, not edited', async () => {
    const editor = await createUser(registry)

    await expect(
      payload.find({ collection: 'migration-runs', overrideAccess: false, user: editor }),
    ).rejects.toThrow()
    await expect(
      payload.create({
        collection: 'migration-runs',
        data: entry('902'),
        overrideAccess: false,
        user: editor,
      }),
    ).rejects.toThrow()
  })

  it('is readable and writable by an administrator', async () => {
    const owner = await createAdmin(registry)

    const created = await payload.create({
      collection: 'migration-runs',
      data: entry('903'),
      overrideAccess: false,
      user: owner,
    })
    const found = await payload.find({
      collection: 'migration-runs',
      where: { sourceTable: { equals: SOURCE_TABLE } },
      overrideAccess: false,
      user: owner,
    })

    expect(found.totalDocs).toBeGreaterThan(0)

    const updated = await payload.update({
      collection: 'migration-runs',
      id: created.id,
      data: { action: 'updated' },
      overrideAccess: false,
      user: owner,
    })

    expect(updated.action).toBe('updated')

    await payload.delete({
      collection: 'migration-runs',
      id: created.id,
      overrideAccess: false,
      user: owner,
    })
  })

  it("stays out of an editor's sidebar, because they cannot open it", async () => {
    const config = await payload.config
    const ledger = config.collections.find((collection) => collection.slug === 'migration-runs')
    const hidden = ledger?.admin.hidden as (args: unknown) => boolean

    expect(typeof hidden).toBe('function')
    expect(hidden({ user: { id: 1, roles: ['editor'] } })).toBe(true)
    expect(hidden({ user: { id: 1, roles: ['admin'] } })).toBe(false)
  })
})
