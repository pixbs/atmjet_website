import { describe, expect, it } from 'vitest'

import {
  chunk,
  runImport,
  type ImportReport,
  type ImportTarget,
  type PendingWrite,
  type RunContext,
} from '../../scripts/migrate/runner'
import { quoteIdentifier, rowsFrom } from '../../scripts/migrate/source'

/**
 * The import runner (issue #76, `docs/adr/0002-database-migration-strategy.md` section 6),
 * away from a database: the chunking, the resume and the dry run are what every importer of
 * E5.5 to E5.12 inherits, so they are pinned against an in-memory source and a target that
 * only remembers what it was asked to do.
 */
interface Row {
  id: number
  name: string
}

interface Doc {
  name: string
  runId: string
}

const rows = (count: number): Row[] =>
  Array.from({ length: count }, (_, index) => ({ id: index + 1, name: `row ${index + 1}` }))

const spec = (source: Row[]) => ({
  source: rowsFrom('airports', source),
  sourceId: (row: Row) => String(row.id),
  transform: (row: Row, run: RunContext): Doc => ({ name: row.name, runId: run.runId }),
})

/** Remembers what it wrote, and answers `imported` from that, as the ledger does. */
function fakeTarget(alreadyImported: string[] = [], existingDocuments: string[] = []) {
  const ledger = new Set(alreadyImported)
  const documents = new Set(existingDocuments)
  const batches: number[] = []
  const written: PendingWrite<Doc>[] = []

  const target: ImportTarget<Doc> = {
    collection: 'airports',
    imported: (sourceIds) => Promise.resolve(new Set(sourceIds.filter((id) => ledger.has(id)))),
    writeBatch: (writes, run) => {
      batches.push(writes.length)

      return Promise.resolve(
        writes.map((write) => {
          const action = documents.has(write.sourceId) ? 'updated' : 'created'

          if (!run.dryRun) {
            ledger.add(write.sourceId)
            documents.add(write.sourceId)
            written.push(write)
          }

          return { sourceId: write.sourceId, action }
        }),
      )
    },
  }

  return { target, batches, written }
}

describe('chunking', () => {
  it('cuts the rows into batches of the size it was given, the last one short', async () => {
    const { target, batches } = fakeTarget()

    const report = await runImport(spec(rows(7)), target, { batchSize: 3 })

    expect(batches).toEqual([3, 3, 1])
    expect(report.read).toBe(7)
    expect(report.created).toBe(7)
  })

  it('does nothing at all with a source that has no rows', async () => {
    const { target, batches } = fakeTarget()

    const report = await runImport(spec([]), target, { batchSize: 3 })

    expect(batches).toEqual([])
    expect(report).toMatchObject({ read: 0, created: 0, updated: 0, skipped: 0 })
  })

  it('reports what it has done so far as each batch finishes', async () => {
    const { target } = fakeTarget()
    const progress: ImportReport[] = []

    await runImport(spec(rows(5)), target, {
      batchSize: 2,
      onBatch: (report) => progress.push(report),
    })

    expect(progress.map((report) => report.read)).toEqual([2, 4, 5])
  })

  it('hands every row to the chunker and keeps their order', async () => {
    const batches: number[][] = []

    for await (const batch of chunk(rowsFrom('airports', rows(5)).rows(), 2))
      batches.push(batch.map((row) => row.id))

    expect(batches).toEqual([[1, 2], [3, 4], [5]])
  })
})

describe('resuming an interrupted run', () => {
  it('skips the rows an earlier run wrote and does the rest', async () => {
    const { target, written } = fakeTarget(['1', '2', '3'])

    const report = await runImport(spec(rows(5)), target, { batchSize: 2 })

    expect(report).toMatchObject({ read: 5, skipped: 3, created: 2, updated: 0 })
    expect(written.map((write) => write.sourceId)).toEqual(['4', '5'])
  })

  it('leaves a second run of the same source with nothing to do', async () => {
    const { target } = fakeTarget()

    await runImport(spec(rows(4)), target)
    const again = await runImport(spec(rows(4)), target)

    expect(again).toMatchObject({ read: 4, skipped: 4, created: 0, updated: 0 })
  })

  it('updates a document that is already there rather than adding a second one', async () => {
    const { target } = fakeTarget([], ['1', '2'])

    const report = await runImport(spec(rows(3)), target)

    expect(report).toMatchObject({ created: 1, updated: 2 })
  })
})

describe('a dry run', () => {
  it('reads everything, says what it would do and writes nothing', async () => {
    const { target, written } = fakeTarget()

    const report = await runImport(spec(rows(3)), target, { dryRun: true })

    expect(report).toMatchObject({ read: 3, created: 3, dryRun: true })
    expect(written).toEqual([])
  })

  it('leaves the next real run everything to do', async () => {
    const { target } = fakeTarget()

    await runImport(spec(rows(3)), target, { dryRun: true })
    const real = await runImport(spec(rows(3)), target)

    expect(real).toMatchObject({ created: 3, skipped: 0 })
  })
})

describe('the run id', () => {
  it('reaches the transform, which is where provenance is written', async () => {
    const { target, written } = fakeTarget()

    await runImport(spec(rows(2)), target, { runId: 'run-of-the-day' })

    expect(written.map((write) => write.doc.runId)).toEqual(['run-of-the-day', 'run-of-the-day'])
  })

  it('is invented when the caller does not give one, and is the same for the whole run', async () => {
    const { target, written } = fakeTarget()

    const report = await runImport(spec(rows(3)), target, { batchSize: 1 })

    expect(report.runId).not.toBe('')
    expect(new Set(written.map((write) => write.doc.runId))).toEqual(new Set([report.runId]))
  })
})

describe('the names an importer interpolates into its statement', () => {
  it('quotes a plain table, schema or column name', () => {
    expect(quoteIdentifier('new_airports')).toBe('"new_airports"')
    expect(quoteIdentifier('_id2')).toBe('"_id2"')
  })

  it('refuses anything that is not one, rather than quoting it', () => {
    for (const name of ['legacy.airports', 'airports; drop table x', 'air"ports', '2fast', ''])
      expect(() => quoteIdentifier(name)).toThrow(/not a table, schema or column name/)
  })
})
