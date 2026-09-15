import type { Payload } from 'payload'

import { DEFAULT_LOCALES } from '../../src/i18n/locales'
import type { SeedOutcome } from './report'

/**
 * The repositioning flights the empty legs section lists, and the airports they fly between
 * (issues #117 and #66, E2.5). Without them the section on `/empty_legs` draws its channel card
 * and nothing else, and the legacy page it is ported from was never empty.
 *
 * Most of the route ends are airports; one is a code with no airport behind it, because the
 * legacy section dropped such a row from the page altogether and this one has to keep drawing it
 * (`docs/legacy-inventory.md` section 6). The rest are what the airport search is exercised
 * against (issue #159): two cities with two airports each, and one airport whose traffic nobody
 * recorded.
 */
interface SeedAirport {
  icao: string
  /** What ranks it in the search (issue #159). The legacy column was text and sorted the other way. */
  passengersPerYear?: number
  en: { city: string; country: string; name: string }
  ru: { city: string; country: string; name: string }
}

export const SEED_AIRPORTS: readonly SeedAirport[] = [
  {
    icao: 'OMDB',
    passengersPerYear: 86_900_000,
    en: { city: 'Dubai', country: 'United Arab Emirates', name: 'Dubai International' },
    ru: { city: 'Дубай', country: 'ОАЭ', name: 'Дубай Интернешнл' },
  },
  {
    icao: 'OMDW',
    passengersPerYear: 1_300_000,
    en: { city: 'Dubai', country: 'United Arab Emirates', name: 'Al Maktoum' },
    ru: { city: 'Дубай', country: 'ОАЭ', name: 'Аль-Мактум' },
  },
  {
    icao: 'LFPB',
    passengersPerYear: 50_000,
    en: { city: 'Paris', country: 'France', name: 'Le Bourget' },
    ru: { city: 'Париж', country: 'Франция', name: 'Ле Бурже' },
  },
  {
    icao: 'LFPG',
    passengersPerYear: 57_500_000,
    en: { city: 'Paris', country: 'France', name: 'Charles de Gaulle' },
    ru: { city: 'Париж', country: 'Франция', name: 'Шарль-де-Голль' },
  },
  {
    icao: 'UUWW',
    passengersPerYear: 15_800_000,
    en: { city: 'Moscow', country: 'Russia', name: 'Vnukovo' },
    ru: { city: 'Москва', country: 'Россия', name: 'Внуково' },
  },
  {
    icao: 'LSGG',
    passengersPerYear: 16_500_000,
    en: { city: 'Geneva', country: 'Switzerland', name: 'Cointrin' },
    ru: { city: 'Женева', country: 'Швейцария', name: 'Куантрен' },
  },
  {
    // No traffic recorded, so the search lists it behind the airports that have some.
    icao: 'EGGW',
    en: { city: 'London', country: 'United Kingdom', name: 'Luton' },
    ru: { city: 'Лондон', country: 'Великобритания', name: 'Лутон' },
  },
]

interface SeedEmptyLeg {
  from: string
  to: string
  departureAt: string
  price?: number
  currency?: 'AED' | 'EUR' | 'USD'
  order: number
}

/**
 * Three flights, in the order the section lists them. The first has already flown and is listed
 * all the same, which is the decision on issue #117 and what the legacy page did; the last has
 * no price and an arrival no airport matches, which is the shape a card has to hold without the
 * struck-through figure and without a city.
 */
export const SEED_EMPTY_LEGS: readonly SeedEmptyLeg[] = [
  {
    from: 'OMDB',
    to: 'LFPB',
    departureAt: '2026-03-05T09:00:00.000Z',
    price: 12_000,
    currency: 'USD',
    order: 1,
  },
  {
    from: 'LFPB',
    to: 'UUWW',
    departureAt: '2026-10-12T06:30:00.000Z',
    price: 8_500,
    currency: 'EUR',
    order: 2,
  },
  { from: 'LSGG', to: 'ZZZZ', departureAt: '2026-11-03T15:45:00.000Z', order: 3 },
]

export async function seedEmptyLegs(payload: Payload): Promise<SeedOutcome[]> {
  const outcomes: SeedOutcome[] = []
  const airports = new Map<string, number>()

  for (const airport of SEED_AIRPORTS) {
    const existing = await payload.find({
      collection: 'airports',
      where: { icao: { equals: airport.icao } },
      limit: 1,
      overrideAccess: true,
    })

    if (existing.totalDocs > 0) {
      airports.set(airport.icao, existing.docs[0].id)
      outcomes.push({
        collection: 'airports',
        key: airport.icao,
        action: 'unchanged',
        id: existing.docs[0].id,
      })
      continue
    }

    const created = await payload.create({
      collection: 'airports',
      data: { icao: airport.icao, passengersPerYear: airport.passengersPerYear, ...airport.en },
      locale: 'en',
      overrideAccess: true,
      // A bulk write has nothing to invalidate (docs/conventions/rendering.md).
      context: { skipRevalidation: true },
    })

    // The other routed locales are translations of the same airport, not new ones.
    for (const locale of DEFAULT_LOCALES.filter((entry) => entry !== 'en'))
      await payload.update({
        collection: 'airports',
        id: created.id,
        data: airport[locale as 'ru'],
        locale,
        overrideAccess: true,
        context: { skipRevalidation: true },
      })

    airports.set(airport.icao, created.id)
    outcomes.push({ collection: 'airports', key: airport.icao, action: 'created', id: created.id })
  }

  for (const leg of SEED_EMPTY_LEGS) {
    const key = `${leg.from}-${leg.to}`
    const existing = await payload.find({
      collection: 'empty-legs',
      where: {
        and: [
          { departureIcao: { equals: leg.from } },
          { arrivalIcao: { equals: leg.to } },
          { departureAt: { equals: leg.departureAt } },
        ],
      },
      limit: 1,
      overrideAccess: true,
    })

    if (existing.totalDocs > 0) {
      outcomes.push({
        collection: 'empty-legs',
        key,
        action: 'unchanged',
        id: existing.docs[0].id,
      })
      continue
    }

    const created = await payload.create({
      collection: 'empty-legs',
      data: {
        arrivalAirport: airports.get(leg.to) ?? null,
        arrivalIcao: leg.to,
        currency: leg.currency ?? 'USD',
        departureAirport: airports.get(leg.from) ?? null,
        departureAt: leg.departureAt,
        departureIcao: leg.from,
        order: leg.order,
        price: leg.price ?? null,
        provenance: { origin: 'manual' },
      },
      overrideAccess: true,
      context: { skipRevalidation: true },
    })

    outcomes.push({ collection: 'empty-legs', key, action: 'created', id: created.id })
  }

  return outcomes
}
