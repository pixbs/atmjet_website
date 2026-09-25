/**
 * The import runner (issue #76, `docs/adr/0002-database-migration-strategy.md` section 6): the
 * part every importer of E5.5 to E5.12 does the same way — read the legacy rows in order, cut
 * them into chunks, skip what an earlier run already wrote, and say afterwards what it did.
 *
 * It knows no table and no collection. The rows are the source's, the documents are the
 * target's, and the transform between them is a pure function each importer unit-tests on its
 * own, away from a database.
 */

/** Rows per chunk, and so per transaction (ADR-0002 section 6). */
export const BATCH_SIZE = 500

export interface ImportSource<Row> {
  /** How the ledger names these rows: `legacy.airports`, `legacy.new_yachts`. */
  readonly table: string
  /** Every row, in an order stable enough that a resumed run reads them the same way. */
  rows(): AsyncIterable<Row>
}

/** What a run is doing, as the transform and the target are told it. */
export interface RunContext {
  runId: string
  /** Reads and reports, writes nothing. */
  dryRun: boolean
}

export interface ImportSpec<Row, Doc> {
  source: ImportSource<Row>
  /** The row's id in its own table: half of the key an interrupted run resumes on. */
  sourceId(row: Row): string
  /** Pure: what the row becomes, provenance included. */
  transform(row: Row, run: RunContext): Doc
}

export type WriteAction = 'created' | 'updated'

export interface PendingWrite<Doc> {
  sourceId: string
  doc: Doc
}

export interface WriteOutcome {
  sourceId: string
  action: WriteAction
}

/**
 * Where the documents land. The runner holds no database of its own: one call to `writeBatch`
 * is one transaction, so a chunk that throws leaves nothing behind and the next run redoes it.
 */
export interface ImportTarget<Doc> {
  /** The collection the rows become documents in, as the report names it. */
  readonly collection: string
  /** Of these source ids, the ones an earlier run has already written. */
  imported(sourceIds: string[]): Promise<Set<string>>
  writeBatch(writes: PendingWrite<Doc>[], run: RunContext): Promise<WriteOutcome[]>
}

export interface ImportOptions {
  batchSize?: number
  dryRun?: boolean
  runId?: string
  /** Called as each chunk finishes, which is what a long run prints as it goes. */
  onBatch?: (progress: ImportReport) => void
}

export interface ImportReport {
  runId: string
  table: string
  collection: string
  /** Rows taken from the source, whether or not they were written. */
  read: number
  created: number
  updated: number
  /** Rows an earlier run had already written. */
  skipped: number
  dryRun: boolean
}

/** Rows arrive one at a time and leave in batches; the last one is short rather than dropped. */
export async function* chunk<T>(rows: AsyncIterable<T>, size: number): AsyncIterable<T[]> {
  let batch: T[] = []

  for await (const row of rows) {
    batch.push(row)

    if (batch.length === size) {
      yield batch
      batch = []
    }
  }

  if (batch.length > 0) yield batch
}

export async function runImport<Row, Doc>(
  spec: ImportSpec<Row, Doc>,
  target: ImportTarget<Doc>,
  options: ImportOptions = {},
): Promise<ImportReport> {
  const { batchSize = BATCH_SIZE, dryRun = false, runId = crypto.randomUUID(), onBatch } = options
  const run: RunContext = { runId, dryRun }
  const report: ImportReport = {
    runId,
    table: spec.source.table,
    collection: target.collection,
    read: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    dryRun,
  }

  for await (const batch of chunk(spec.source.rows(), batchSize)) {
    report.read += batch.length

    const ids = batch.map((row) => spec.sourceId(row))
    const done = await target.imported(ids)
    const writes = batch
      .map((row, index) => ({ sourceId: ids[index] as string, row }))
      .filter((write) => !done.has(write.sourceId))

    report.skipped += batch.length - writes.length

    if (writes.length > 0) {
      const outcomes = await target.writeBatch(
        writes.map(({ sourceId, row }) => ({ sourceId, doc: spec.transform(row, run) })),
        run,
      )

      for (const outcome of outcomes) report[outcome.action] += 1
    }

    onBatch?.({ ...report })
  }

  return report
}
