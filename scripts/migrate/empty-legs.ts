import type { Payload } from 'payload'

import { normaliseCode, normaliseText } from '../../src/lib/airports'
import { runImport, type ImportReport } from './runner'
import { tableRows } from './source'
import { payloadTarget, present, type TargetDocument } from './target'

/**
 * Empty legs (issue #83, `docs/adr/0002-database-migration-strategy.md` item 7):
 * `atmjet_admin__empty_legs` into EmptyLegs, after the airports. Both ends are resolved by their
 * ICAO code against the imported airports; a code no airport answers to stays as the text the
 * collection keeps for it, and the run lists it, where the legacy section silently dropped the
 * row (`docs/legacy-inventory.md` section 5).
 *
 * The aircraft relationship is left empty: `type` and `company` are free text the legacy admin
 * typed, and matching them to the catalogue would be a guess.
 */
export interface EmptyLegRow {
  id: number
  start: Date | string
  end: Date | string
  from: string
  to: string
  type: string | null
  category: string | null
  company: string | null
  safety: string | null
  price: number | null
  order: number | null
}

export interface Unresolved {
  leg: number
  column: 'from' | 'to'
  icao: string
}

/** A `timestamptz` as the instant it is, in UTC whatever the server's zone. */
function utc(value: Date | string): string {
  return new Date(value).toISOString()
}

export function fromEmptyLeg(
  row: EmptyLegRow,
  context: { runId: string; importedAt: string; airports: ReadonlyMap<string, number> },
): { doc: TargetDocument<'empty-legs'>; unresolved: Unresolved[] } {
  const unresolved: Unresolved[] = []
  const end = (column: Unresolved['column']) => {
    const icao = normaliseCode(row[column])
    const airport = icao === undefined ? undefined : context.airports.get(icao)
    if (icao !== undefined && airport === undefined) unresolved.push({ leg: row.id, column, icao })

    return { icao, airport }
  }
  const from = end('from')
  const to = end('to')
  // `min: 0` on the field; a negative price is kept rather than refused.
  const price = row.price === null || row.price >= 0 ? row.price : undefined

  return {
    unresolved,
    doc: {
      data: present({
        departureAt: utc(row.start),
        arrivalAt: utc(row.end),
        departureIcao: from.icao,
        departureAirport: from.airport,
        arrivalIcao: to.icao,
        arrivalAirport: to.airport,
        price,
        order: row.order,
        aircraft: present({
          type: normaliseText(row.type),
          category: normaliseText(row.category),
          company: normaliseText(row.company),
          safety: normaliseText(row.safety),
        }),
        legacyAttributes: price === undefined ? { price: row.price } : undefined,
        provenance: {
          origin: 'empty-legs-legacy' as const,
          legacyId: row.id,
          importRunId: context.runId,
          importedAt: context.importedAt,
        },
      }),
    },
  }
}

export interface EmptyLegsImport {
  report: ImportReport
  unresolved: Unresolved[]
}

export async function importEmptyLegs(
  payload: Payload,
  options: { schema?: string; dryRun?: boolean; runId?: string } = {},
): Promise<EmptyLegsImport> {
  const { schema = 'legacy', dryRun = false, runId = crypto.randomUUID() } = options
  const { docs: airports } = await payload.find({
    collection: 'airports',
    where: { icao: { exists: true } },
    select: { icao: true },
    pagination: false,
    depth: 0,
    overrideAccess: true,
  })
  const context = {
    runId,
    importedAt: new Date().toISOString(),
    airports: new Map(airports.map((airport) => [airport.icao as string, airport.id])),
  }
  const unresolved: Unresolved[] = []
  const source = tableRows<EmptyLegRow>(payload, {
    schema,
    table: 'atmjet_admin__empty_legs',
    orderBy: 'id',
  })
  const report = await runImport(
    {
      source,
      sourceId: (row) => String(row.id),
      transform: (row) => {
        const { doc, unresolved: missing } = fromEmptyLeg(row, context)

        unresolved.push(...missing)
        return doc
      },
    },
    payloadTarget(payload, {
      collection: 'empty-legs',
      table: source.table,
      naturalKey: (data) => ({ 'provenance.legacyId': { equals: data.provenance.legacyId } }),
    }),
    { dryRun, runId },
  )

  return { report, unresolved }
}
