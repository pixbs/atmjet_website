import type {
  CollectionSlug,
  Payload,
  PayloadRequest,
  RequiredDataFromCollectionSlug,
  Where,
} from 'payload'

import type { ImportTarget, PendingWrite, RunContext, WriteOutcome } from './runner'

/**
 * The Payload end of an import (issue #76, `docs/adr/0002-database-migration-strategy.md`
 * section 6): documents written through the Local API with access control off, population off
 * and the revalidation hooks quiet, each chunk in one transaction together with the ledger rows
 * that let the next run skip it.
 *
 * Idempotent by natural key rather than by insert: a document an earlier import — or an editor
 * — already wrote is updated, so running an importer twice leaves the same number of documents
 * behind.
 */
export interface PayloadTargetSpec<TSlug extends CollectionSlug> {
  collection: TSlug
  /** The legacy table, which the ledger records next to the row's own id. */
  table: string
  /** Finds the document this row is, whoever wrote it first. */
  naturalKey(doc: RequiredDataFromCollectionSlug<TSlug>): Where
}

/** The hooks a bulk run does not want: one revalidation per row would drop the cache per row. */
const QUIET = { skipRevalidation: true }

/**
 * Payload's `create` and `update` overloads resolve against the union of every collection, and
 * a slug held in a variable cannot narrow it. The importer is where the shape is checked — its
 * transform is typed against the collection it writes — so the two calls go through the pair of
 * signatures they actually need.
 */
interface CollectionWriter {
  create(options: {
    collection: CollectionSlug
    data: object
    depth: number
    overrideAccess: boolean
    context: object
    req?: Partial<PayloadRequest>
  }): Promise<{ id: number | string }>
  update(options: {
    collection: CollectionSlug
    id: number | string
    data: object
    depth: number
    overrideAccess: boolean
    context: object
    req?: Partial<PayloadRequest>
  }): Promise<{ id: number | string }>
}

export function payloadTarget<TSlug extends CollectionSlug>(
  payload: Payload,
  spec: PayloadTargetSpec<TSlug>,
): ImportTarget<RequiredDataFromCollectionSlug<TSlug>> {
  type Doc = RequiredDataFromCollectionSlug<TSlug>

  const writer = payload as unknown as CollectionWriter
  const keyOf = (sourceId: string) => `${spec.table}:${sourceId}`

  const existingId = async (doc: Doc, req?: Partial<PayloadRequest>) => {
    const found = await payload.find({
      collection: spec.collection,
      where: spec.naturalKey(doc),
      depth: 0,
      overrideAccess: true,
      pagination: false,
      limit: 1,
      req,
    })

    return found.docs[0]?.id
  }

  const write = async (
    { sourceId, doc }: PendingWrite<Doc>,
    run: RunContext,
    req: Partial<PayloadRequest>,
  ): Promise<WriteOutcome> => {
    const id = await existingId(doc, req)
    const common = {
      collection: spec.collection,
      data: doc as object,
      depth: 0,
      overrideAccess: true,
      context: QUIET,
      req,
    }
    const written =
      id === undefined ? await writer.create(common) : await writer.update({ ...common, id })
    const action = id === undefined ? 'created' : 'updated'

    await payload.create({
      collection: 'migration-runs',
      data: {
        sourceKey: keyOf(sourceId),
        sourceTable: spec.table,
        sourceId,
        target: spec.collection,
        documentId: String(written.id),
        action,
        runId: run.runId,
      },
      depth: 0,
      overrideAccess: true,
      context: QUIET,
      req,
    })

    return { sourceId, action }
  }

  return {
    collection: spec.collection,

    async imported(sourceIds) {
      if (sourceIds.length === 0) return new Set()

      const { docs } = await payload.find({
        collection: 'migration-runs',
        where: { sourceKey: { in: sourceIds.map(keyOf) } },
        depth: 0,
        overrideAccess: true,
        pagination: false,
      })

      return new Set(docs.map((doc) => doc.sourceId))
    },

    async writeBatch(writes, run) {
      if (run.dryRun) {
        const outcomes: WriteOutcome[] = []

        for (const pending of writes)
          outcomes.push({
            sourceId: pending.sourceId,
            action: (await existingId(pending.doc)) ? 'updated' : 'created',
          })

        return outcomes
      }

      // One transaction per chunk: an importer that dies mid-chunk leaves neither half-written
      // documents nor ledger rows claiming work that was rolled back.
      const transactionID = await payload.db.beginTransaction()
      const req: Partial<PayloadRequest> = transactionID === null ? {} : { transactionID }

      try {
        const outcomes: WriteOutcome[] = []

        for (const pending of writes) outcomes.push(await write(pending, run, req))

        if (transactionID !== null) await payload.db.commitTransaction(transactionID)

        return outcomes
      } catch (error) {
        if (transactionID !== null) await payload.db.rollbackTransaction(transactionID)

        throw error
      }
    },
  }
}
