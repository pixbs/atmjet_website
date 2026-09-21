import type { Payload } from 'payload'

import type { SeedOutcome } from './report'

/**
 * Five aircraft (issues #142 and #63, E2.5), so the section the sales department page carries
 * has something to show: three filled in as the legacy `vehicles` table filled a row, one an
 * editor has only started — which is the card without a year under it — and one nobody has
 * photographed, which is the page that falls back to the basic layout (issue #137).
 *
 * The catalogue proper arrives with the import of E5.7; this is the fixture that lets the
 * section be rendered and captured before it does.
 */
interface SeedAircraft {
  registration: string
  model: string
  category: string
  year?: number
  passengers?: number
  /** Metres, as the legacy `aircraft_type_cabin_height` held them: what "size" sorts by. */
  cabinHeight?: number
  /** Kilometres, as the legacy `aircraft_type_range_maximum` held them. */
  rangeMaximum?: number
  /** Metres, the pair the rich layout prints as `length/width` (issue #136). */
  cabinLength?: number
  cabinWidth?: number
  /** From the legacy extension_description; the head and the structured data read it (#170). */
  description?: string
  /** The two the rich layout's sentences name beside the figures (issue #136). */
  operator?: string
  baseAirportIcao?: string
  /** The three remaining rows of the basic layout's card (issue #137). */
  manufacturer?: string
  interiorRefit?: string
  exteriorRefit?: string
  /** False for the one aircraft the catalogue holds no photograph of (issue #137). */
  photographed?: false
}

// The registrations are ones no test writes by hand: the fixture and the integration tier share
// a database, and `registration` is the collection's natural key.
export const SEED_AIRCRAFT: readonly SeedAircraft[] = [
  {
    registration: 'M-OUSE',
    model: 'Bombardier Global 6000',
    category: 'Ultra long range',
    year: 2021,
    passengers: 13,
    cabinHeight: 1.88,
    rangeMaximum: 11112,
    // The one aircraft filled in far enough to draw the rich layout whole (issue #136): the
    // pair of cabin measurements and a description of more than one paragraph.
    cabinLength: 13.18,
    cabinWidth: 2.49,
    operator: 'ATM JET',
    // A seeded airport, so the sentence about where she is based has somewhere to name.
    baseAirportIcao: 'OMDB',
    description:
      'Thirteen seats and a bed, out of Dubai, with the range for a leg nobody wants to break.\nRefurbished in 2021 and flown by the crew who know her, she leaves from the stand she is parked on.',
  },
  {
    registration: 'T7-ATM',
    model: 'Gulfstream G650ER',
    category: 'Ultra long range',
    year: 2019,
    passengers: 14,
    cabinHeight: 1.95,
    rangeMaximum: 13890,
  },
  {
    registration: '9H-ATM',
    model: 'Embraer Legacy 650',
    category: 'Heavy jet',
    year: 2016,
    passengers: 13,
    cabinHeight: 1.82,
    rangeMaximum: 7223,
  },
  // The one an editor has only started: the listing sorts it last whichever way round it is
  // asked for, because nothing about it has been measured yet (issue #135).
  { registration: 'VP-CAT', model: 'Cessna Citation XLS+', category: 'Midsize jet' },
  {
    // The one nobody has photographed, which is the page the basic layout draws (issue #137):
    // every row of its card is filled in, because the card is the whole of what it says.
    registration: 'G-ATMB',
    model: 'Dassault Falcon 7X',
    category: 'Heavy jet',
    manufacturer: 'Dassault',
    year: 2014,
    passengers: 12,
    operator: 'ATM JET',
    baseAirportIcao: 'LFPB',
    interiorRefit: '2019',
    exteriorRefit: '2018',
    photographed: false,
  },
]

export async function seedAircraft(payload: Payload): Promise<SeedOutcome[]> {
  const outcomes: SeedOutcome[] = []
  // The placeholder upload the rest of the fixture draws (issue #41).
  const media = await payload.find({
    collection: 'media',
    limit: 1,
    depth: 0,
    sort: 'id',
    overrideAccess: true,
  })
  const photo = media.docs[0]?.id

  /** The airports the empty-legs fixture seeds, so a base can be named by its ICAO (#136). */
  const airports = await payload.find({
    collection: 'airports',
    limit: 0,
    depth: 0,
    overrideAccess: true,
  })
  const airportBy = (icao: string | undefined) =>
    icao === undefined ? undefined : airports.docs.find((airport) => airport.icao === icao)?.id

  for (const aircraft of SEED_AIRCRAFT) {
    const existing = await payload.find({
      collection: 'aircraft',
      where: { registrationDisplay: { equals: aircraft.registration } },
      limit: 1,
      overrideAccess: true,
    })

    if (existing.totalDocs > 0) {
      outcomes.push({
        collection: 'aircraft',
        key: aircraft.registration,
        action: 'unchanged',
        id: existing.docs[0]!.id,
      })
      continue
    }

    const created = await payload.create({
      collection: 'aircraft',
      data: {
        registrationDisplay: aircraft.registration,
        availability: 'available',
        offerings: ['charter', 'sale'],
        type: {
          name: aircraft.model,
          model: aircraft.model,
          category: aircraft.category,
          manufacturer: aircraft.manufacturer,
        },
        description: aircraft.description,
        operator: aircraft.operator === undefined ? undefined : { companyName: aircraft.operator },
        baseAirport: airportBy(aircraft.baseAirportIcao),
        specification: {
          passengers: aircraft.passengers,
          yearOfProduction: aircraft.year,
          cabinHeight: aircraft.cabinHeight,
          cabinLength: aircraft.cabinLength,
          cabinWidth: aircraft.cabinWidth,
          rangeMaximum: aircraft.rangeMaximum,
          interiorRefit: aircraft.interiorRefit,
          exteriorRefit: aircraft.exteriorRefit,
        },
        images:
          photo === undefined || aircraft.photographed === false
            ? []
            : [{ type: 'exterior', media: photo }],
        provenance: { origin: 'manual' },
      },
      overrideAccess: true,
      // A bulk write has nothing to invalidate (docs/conventions/rendering.md).
      context: { skipRevalidation: true },
    })

    outcomes.push({
      collection: 'aircraft',
      key: aircraft.registration,
      action: 'created',
      id: created.id,
    })
  }

  return outcomes
}
