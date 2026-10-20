import type { Payload } from 'payload'

import type { Aircraft } from '../../src/payload-types'
import { normaliseCode, normaliseText } from '../../src/lib/airports'
import { canonicalRegistration } from '../../src/lib/aircraft'
import { aircraftKey } from './aircraft'
import { runImport, type ImportReport } from './runner'
import { tableRows } from './source'
import { payloadTarget, present, type TargetDocument } from './target'

/**
 * The planes of the older `vehicles` table (issue #79, `docs/adr/0002-database-migration-strategy.md`
 * items 7 and 8), after the catalogue. A row with a tail number is a plane; the yacht rows stay in
 * the frozen `legacy` schema (the decision of issue #80).
 *
 * A plane whose canonical registration the catalogue already has is merged into that document:
 * the catalogue wins, the row only fills what the document lacks, and it is listed in
 * `provenance.mergedFrom`. Any other plane becomes a document of its own, `vehicles-legacy`, at
 * the tail number the legacy `/aircraft/<tail>` URLs used, so those URLs still answer.
 *
 * `image` and `thumb` are kept, with their scheme, in `legacyAttributes` rather than `images`:
 * a photograph there would put these planes in the listing and switch their page to the rich
 * layout, neither of which the legacy site did (`docs/legacy-inventory.md` section 4). The media
 * import (E5.12) decides where they go. Every other column no field takes is kept there too,
 * under `vehicles.<id>`, so two rows merged into one document never overwrite each other.
 */
export interface VehiclesRow {
  id: number
  tail_number: string | null
  tail_model: string | null
  tail_manufacturer: string | null
  tail_year: string | null
  tail_maxpax: string | null
  tail_operator: string | null
  tail_interiorrefit: string | null
  tail_exteriorrefit: string | null
  tail_homebase: string | null
  image: string | null
  thumb: string | null
  /** The shop and yacht columns, which no field takes (the decision of issue #80). */
  [column: string]: unknown
}

type Candidate = TargetDocument<'aircraft'>

/** What the merge reads of a document already written: its fields at depth 0. */
export type ExistingAircraft = Pick<
  Aircraft,
  | 'registrationDisplay'
  | 'type'
  | 'specification'
  | 'operator'
  | 'baseAirport'
  | 'legacyAttributes'
  | 'provenance'
>

export interface VehicleContext {
  runId: string
  importedAt: string
  airports: ReadonlyMap<string, number>
}

export function isPlane(row: Pick<VehiclesRow, 'tail_number'>): boolean {
  return (row.tail_number ?? '').trim() !== ''
}

/** The slug of the legacy URL: `/aircraft/<tail number>`, as the old sitemap wrote it. */
export function vehicleSlug(tailNumber: string): string {
  return tailNumber.trim().replace(/\s+/g, '-')
}

/** The rows kept `image` without a scheme; the legacy card put `https://` in front. */
function absolute(value: unknown): string | undefined {
  const text = typeof value === 'string' ? value.trim() : ''
  if (text === '') return undefined

  return /^[a-z][a-z\d+.-]*:\/\//i.test(text) ? text : `https://${text}`
}

/** A count or a year as the `varchar` columns held it, when it is one. */
function whole(value: string | null): number | undefined {
  const text = (value ?? '').trim()

  return /^\d+$/.test(text) ? Number(text) : undefined
}

/** The columns a field takes, when it takes them; `image` and `thumb` are stored normalised. */
const TAKEN = new Set([
  'id',
  'tail_number',
  'tail_model',
  'tail_manufacturer',
  'tail_operator',
  'tail_interiorrefit',
  'tail_exteriorrefit',
  'image',
  'thumb',
])

/** Every column no field took, as the row held it; empty values are left out. */
function attributes(row: VehiclesRow, taken: Set<string>): Record<string, unknown> {
  const kept = Object.entries(row).filter(
    ([column, value]) =>
      !taken.has(column) && value !== null && value !== undefined && value !== '',
  )

  return {
    ...Object.fromEntries(kept),
    ...present({ image: absolute(row.image), thumb: absolute(row.thumb) }),
  }
}

/** The existing value wherever there is one, the row's only where there is not. */
function fill<T extends object>(existing: T | null | undefined, candidate: T): T {
  return { ...present(candidate), ...present(existing ?? ({} as T)) }
}

export function fromVehicle(
  row: VehiclesRow,
  existing: ExistingAircraft | undefined,
  context: VehicleContext,
): Candidate {
  const tail = (row.tail_number ?? '').trim()
  const year = whole(row.tail_year)
  const passengers = whole(row.tail_maxpax)
  const taken = new Set(TAKEN)
  if (year !== undefined) taken.add('tail_year')
  if (passengers !== undefined) taken.add('tail_maxpax')

  const home = normaliseCode(row.tail_homebase)
  const type = present({
    model: normaliseText(row.tail_model),
    manufacturer: normaliseText(row.tail_manufacturer),
  })
  const specification = present({
    yearOfProduction: year,
    passengers,
    interiorRefit: normaliseText(row.tail_interiorrefit),
    exteriorRefit: normaliseText(row.tail_exteriorrefit),
  })
  const operator = present({ companyName: normaliseText(row.tail_operator) })
  const baseAirport = home === undefined ? undefined : context.airports.get(home)
  const legacyAttributes = (existing?.legacyAttributes ?? {}) as Record<string, unknown>
  const vehicles = {
    ...((legacyAttributes.vehicles ?? {}) as Record<string, unknown>),
    [row.id]: attributes(row, taken),
  }

  if (existing === undefined)
    return {
      data: present({
        registrationDisplay: tail,
        slug: vehicleSlug(tail),
        type,
        specification,
        operator,
        baseAirport,
        legacyAttributes: { vehicles },
        provenance: {
          origin: 'vehicles-legacy' as const,
          legacyVehicleId: row.id,
          legacyTailNumber: tail,
          importRunId: context.runId,
          importedAt: context.importedAt,
        },
      }),
    }

  const merged = (existing.provenance.mergedFrom ?? []).map(({ table, legacyId }) => ({
    table,
    legacyId,
  }))
  const listed = merged.some((one) => one.table === 'vehicles' && one.legacyId === row.id)

  return {
    data: present({
      registrationDisplay: existing.registrationDisplay,
      type: fill(existing.type, type),
      specification: fill(existing.specification, specification),
      operator: fill(existing.operator, operator),
      baseAirport:
        typeof existing.baseAirport === 'object' && existing.baseAirport !== null
          ? existing.baseAirport.id
          : (existing.baseAirport ?? baseAirport),
      legacyAttributes: { ...legacyAttributes, vehicles },
      provenance: {
        ...existing.provenance,
        legacyVehicleId: existing.provenance.legacyVehicleId ?? row.id,
        legacyTailNumber: existing.provenance.legacyTailNumber ?? tail,
        mergedFrom: listed ? merged : [...merged, { table: 'vehicles', legacyId: row.id }],
      },
    }),
  }
}

async function existingAircraft(payload: Payload): Promise<Map<string, ExistingAircraft>> {
  const { docs } = await payload.find({
    collection: 'aircraft',
    pagination: false,
    depth: 0,
    overrideAccess: true,
  })

  return new Map(docs.map((doc) => [doc.registration ?? '', doc]))
}

export async function importVehicles(
  payload: Payload,
  options: { schema?: string; dryRun?: boolean; runId?: string } = {},
): Promise<ImportReport> {
  const { schema = 'legacy', dryRun = false, runId = crypto.randomUUID() } = options
  const existing = await existingAircraft(payload)
  const { docs: airports } = await payload.find({
    collection: 'airports',
    where: { icao: { exists: true } },
    select: { icao: true },
    pagination: false,
    depth: 0,
    overrideAccess: true,
  })
  const context: VehicleContext = {
    runId,
    importedAt: new Date().toISOString(),
    airports: new Map(airports.map((airport) => [airport.icao as string, airport.id])),
  }
  const all = tableRows<VehiclesRow>(payload, { schema, table: 'vehicles', orderBy: 'id' })
  const planes = {
    table: all.table,
    async *rows() {
      for await (const row of all.rows()) if (isPlane(row)) yield row
    },
  }

  return runImport(
    {
      source: planes,
      sourceId: (row) => String(row.id),
      transform: (row) => {
        const key = canonicalRegistration(row.tail_number) ?? ''
        const doc = fromVehicle(row, existing.get(key), context)

        // A second row of the same plane later in the run merges into what this one wrote.
        existing.set(key, { ...existing.get(key), ...doc.data } as ExistingAircraft)

        return doc
      },
    },
    payloadTarget(payload, { collection: 'aircraft', table: all.table, naturalKey: aircraftKey }),
    { dryRun, runId },
  )
}
