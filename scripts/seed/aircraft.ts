import type { Payload } from 'payload'

import type { SeedOutcome } from './report'

/**
 * Four aircraft (issues #142 and #63, E2.5), so the section the sales department page carries
 * has something to show: three filled in as the legacy `vehicles` table filled a row, and one
 * an editor has only started — which is the card without a year under it.
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
        type: { name: aircraft.model, model: aircraft.model, category: aircraft.category },
        specification: {
          passengers: aircraft.passengers,
          yearOfProduction: aircraft.year,
          cabinHeight: aircraft.cabinHeight,
          rangeMaximum: aircraft.rangeMaximum,
        },
        images: photo === undefined ? [] : [{ type: 'exterior', media: photo }],
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
