import type { Payload, Where } from 'payload'

import { normaliseCode, normaliseText } from '../../src/lib/airports'
import { canonicalRegistration } from '../../src/lib/aircraft'
import { runImport, type ImportReport } from './runner'
import { tableRows } from './source'
import { payloadTarget, present, type TargetDocument } from './target'

/**
 * The aircraft catalogue (issue #78, `docs/adr/0002-database-migration-strategy.md` items 7
 * and 8): `aircrafts` and its `aircraft_images` into the Aircraft collection, one document per
 * catalogue row, its images as external URLs in the order the legacy detail page showed them.
 *
 * Every column lands in a field or in `legacyAttributes`. The four `real` columns are read as
 * the text Postgres prints, so a cabin 1.85 m high stays 1.85 rather than 1.850000023841858.
 */

/** The `real` columns, which the source reads a second time as text. */
const REAL_COLUMNS = [
  'aircraft_type_speed_typical',
  'aircraft_type_cabin_height',
  'aircraft_type_cabin_length',
  'aircraft_type_cabin_width',
] as const

type RealText = { [Column in (typeof REAL_COLUMNS)[number] as `${Column}_text`]: string | null }

export interface AircraftsRow extends RealText {
  id: number
  slug: string
  registration_number: string | null
  year_of_production: number | null
  passengers_max: number | null
  serial_number: string | null
  hours_flown: number | null
  cycles: number | null
  verified_at: string | null
  tech_operator: string | null
  is_cargo: boolean | null
  is_for_sale: boolean | null
  is_for_lease: boolean | null
  is_for_charter: boolean | null
  pdf_attachment: string | null
  pdf_attachment_name: string | null
  company_slug: string | null
  company_name: string | null
  extension_refurbishment: boolean | null
  extension_view_360: string | null
  extension_cabin_crew: boolean | null
  extension_divan_seats: number | null
  extension_lavatory: boolean | null
  extension_beds: number | null
  extension_hot_meal: boolean | null
  extension_wireless_internet: boolean | null
  extension_pets_allowed: boolean | null
  extension_cabin_height: string | null
  extension_cabin_length: string | null
  extension_cabin_width: string | null
  extension_luggage_volume: string | null
  extension_shower: boolean | null
  extension_satellite_phone: boolean | null
  extension_sleeping_places: number | null
  extension_description: string | null
  extension_spec_equipment: string | null
  airport_iata: string | null
  airport_icao: string | null
  airport_name: string | null
  aircraft_type_slug: string | null
  aircraft_type_name: string | null
  aircraft_type_range_maximum: number | null
  aircraft_type_pax_maximum: number | null
  aircraft_type_aircraft_class_name: string | null
}

export interface AircraftImageRow {
  id: number
  aircraft_id: number
  type: 'exterior' | 'cabin' | 'cockpit'
  url: string
}

export interface CatalogueContext {
  runId: string
  importedAt: string
  /** Airport document ids by ICAO code, which the airports import wrote first. */
  airports: ReadonlyMap<string, number>
}

type Aircraft = TargetDocument<'aircraft'>

/** A number as Postgres printed it, or nothing when it printed none. */
function decimal(text: string | null): number | undefined {
  const trimmed = (text ?? '').trim()
  const number = trimmed === '' ? Number.NaN : Number(trimmed)

  return Number.isFinite(number) ? number : undefined
}

const OFFERINGS = [
  ['is_for_charter', 'charter'],
  ['is_for_sale', 'sale'],
  ['is_for_lease', 'lease'],
  ['is_cargo', 'cargo'],
] as const

export function fromCatalogue(
  row: AircraftsRow,
  images: readonly AircraftImageRow[],
  context: CatalogueContext,
): Aircraft {
  const icao = normaliseCode(row.airport_icao)
  const baseAirport = icao === undefined ? undefined : context.airports.get(icao)
  const legacyAttributes = present({
    verified_at: normaliseText(row.verified_at),
    extension_cabin_height: normaliseText(row.extension_cabin_height),
    extension_cabin_length: normaliseText(row.extension_cabin_length),
    extension_cabin_width: normaliseText(row.extension_cabin_width),
    airport_iata: normaliseText(row.airport_iata),
    airport_name: normaliseText(row.airport_name),
    // Kept only when no airport answers to it, so an unresolved code is not lost.
    airport_icao: baseAirport === undefined ? normaliseText(row.airport_icao) : undefined,
  })

  return {
    data: present({
      // A catalogue row with no registration keeps its slug as one: the field is required, and
      // the slug is the one identifier every row has.
      registrationDisplay: normaliseText(row.registration_number) ?? row.slug,
      slug: row.slug,
      offerings: OFFERINGS.filter(([column]) => row[column] === true).map(([, value]) => value),
      type: present({
        name: normaliseText(row.aircraft_type_name),
        slug: normaliseText(row.aircraft_type_slug),
        category: normaliseText(row.aircraft_type_aircraft_class_name),
      }),
      specification: present({
        passengers: row.passengers_max,
        typePassengers: row.aircraft_type_pax_maximum,
        rangeMaximum: row.aircraft_type_range_maximum,
        speedTypical: decimal(row.aircraft_type_speed_typical_text),
        cabinHeight: decimal(row.aircraft_type_cabin_height_text),
        cabinLength: decimal(row.aircraft_type_cabin_length_text),
        cabinWidth: decimal(row.aircraft_type_cabin_width_text),
        yearOfProduction: row.year_of_production,
        serialNumber: normaliseText(row.serial_number),
        hoursFlown: row.hours_flown,
        cycles: row.cycles,
        luggageVolume: normaliseText(row.extension_luggage_volume),
        sleepingPlaces: row.extension_sleeping_places,
        divanSeats: row.extension_divan_seats,
        beds: row.extension_beds,
      }),
      amenities: present({
        cabinCrew: row.extension_cabin_crew,
        lavatory: row.extension_lavatory,
        shower: row.extension_shower,
        hotMeal: row.extension_hot_meal,
        wirelessInternet: row.extension_wireless_internet,
        satellitePhone: row.extension_satellite_phone,
        petsAllowed: row.extension_pets_allowed,
        refurbishment: row.extension_refurbishment,
      }),
      operator: present({
        companyName: normaliseText(row.company_name),
        companySlug: normaliseText(row.company_slug),
        technicalOperator: normaliseText(row.tech_operator),
      }),
      baseAirport,
      description: row.extension_description?.trim() || undefined,
      specialEquipment: row.extension_spec_equipment?.trim() || undefined,
      view360Url: normaliseText(row.extension_view_360),
      brochure: present({
        url: normaliseText(row.pdf_attachment),
        name: normaliseText(row.pdf_attachment_name),
      }),
      // In the order of their ids, which is the order the detail page read them in.
      images: [...images]
        .sort((a, b) => a.id - b.id)
        .map((image) => ({ type: image.type, externalUrl: image.url.trim() })),
      legacyAttributes: Object.keys(legacyAttributes).length > 0 ? legacyAttributes : undefined,
      provenance: {
        origin: 'aircrafts-catalog' as const,
        legacyAircraftId: row.id,
        legacySlug: row.slug,
        importRunId: context.runId,
        importedAt: context.importedAt,
      },
    }),
  }
}

/** The aircraft a row is: its canonical registration, the key E5.7 merges `vehicles` on. */
export function aircraftKey(data: Aircraft['data']): Where {
  return { registration: { equals: canonicalRegistration(data.registrationDisplay) ?? '' } }
}

async function catalogueLookups(payload: Payload, schema: string) {
  const images = new Map<number, AircraftImageRow[]>()
  const source = tableRows<AircraftImageRow>(payload, {
    schema,
    table: 'aircraft_images',
    orderBy: 'id',
  })

  for await (const image of source.rows())
    images.set(image.aircraft_id, [...(images.get(image.aircraft_id) ?? []), image])

  const { docs } = await payload.find({
    collection: 'airports',
    where: { icao: { exists: true } },
    select: { icao: true },
    pagination: false,
    depth: 0,
    overrideAccess: true,
  })
  const airports = new Map(docs.map((airport) => [airport.icao as string, airport.id]))

  return { images, airports }
}

export async function importCatalogue(
  payload: Payload,
  options: { schema?: string; dryRun?: boolean; runId?: string } = {},
): Promise<ImportReport> {
  const { schema = 'legacy', dryRun = false, runId = crypto.randomUUID() } = options
  const { images, airports } = await catalogueLookups(payload, schema)
  const context = { runId, importedAt: new Date().toISOString(), airports }
  const source = tableRows<AircraftsRow>(payload, {
    schema,
    table: 'aircrafts',
    orderBy: 'id',
    textColumns: [...REAL_COLUMNS],
  })

  return runImport(
    {
      source,
      sourceId: (row) => String(row.id),
      transform: (row) => fromCatalogue(row, images.get(row.id) ?? [], context),
    },
    payloadTarget(payload, {
      collection: 'aircraft',
      table: source.table,
      naturalKey: aircraftKey,
    }),
    { dryRun, runId },
  )
}
