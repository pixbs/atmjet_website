import type { Payload, Where } from 'payload'

import { DEFAULT_LOCALE, type Locale } from '@/i18n/locales'
import {
  airportOption,
  MIN_SEARCH_LENGTH,
  rankAirports,
  SEARCH_LIMIT,
  type RankedAirport,
} from '@/lib/airports'

import { getPayloadClient } from './payload'

/**
 * The airports a term matches, as the autocomplete lists them (issue #159).
 *
 * The legacy search (`docs/legacy-inventory.md` section 8.5) matched ten columns with one
 * `ILIKE '%term%'` — five fields in each of its two languages, so a visitor reading the English
 * site could type the name they knew — and ordered by `passengers_per_year`, a text column,
 * ascending, which put the smallest airports first and sorted `9` above `1000000`. The column is
 * a number here and the order is descending, which section 13 entry 69 marks `fix-while-porting`.
 *
 * Both halves survive: the read asks for every language at once, which is what matches a term in
 * either, and each result is then named in the language of the page, falling back to the default
 * one exactly as the legacy template's `ru || en` did.
 *
 * It reads twice because Postgres sorts nulls first on a descending order: the airports whose
 * traffic is known come back ranked, and the rest fill the list behind them rather than
 * displacing them.
 */

/** What one line of the list needs, and what ranks it. */
const SELECT = {
  city: true,
  country: true,
  name: true,
  icao: true,
  iata: true,
  passengersPerYear: true,
} as const

/** A localized field read with `locale: 'all'`: one value per language. */
type Translated = Partial<Record<Locale, string | null>> | string | null | undefined

/** The fields the legacy search matched. Read for every language, as its ten columns were. */
function matching(term: string): Where {
  return {
    or: [
      { city: { like: term } },
      { country: { like: term } },
      { name: { like: term } },
      { aliases: { like: term } },
      { icao: { like: term } },
      { iata: { like: term } },
    ],
  }
}

/** The name in the language being read, or the default one, as the legacy `ru || en` chose. */
function inLocale(value: Translated, locale: Locale): string | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') return value

  return value[locale] || value[DEFAULT_LOCALE] || null
}

export async function searchAirports(
  { term, locale, limit = SEARCH_LIMIT }: { term: string; locale: Locale; limit?: number },
  // Injected so the integration tier can read through its own Payload instance.
  client: () => Promise<Payload> = getPayloadClient,
): Promise<string[]> {
  const wanted = term.trim()
  if (wanted.length < MIN_SEARCH_LENGTH) return []

  try {
    const payload = await client()
    const read = (where: Where, sort: string, rows: number) =>
      payload.find({
        collection: 'airports',
        // Every language at once: a localized field is matched in one locale at a time, and the
        // legacy search matched both of its own.
        locale: 'all',
        where,
        sort,
        limit: rows,
        depth: 0,
        select: SELECT,
        pagination: false,
        // Only what a visitor can read: the field is offered before anyone signs in.
        overrideAccess: false,
      })

    const ranked = await read(
      { and: [matching(wanted), { passengersPerYear: { exists: true } }] },
      '-passengersPerYear',
      limit,
    )
    const missing = limit - ranked.docs.length
    const rest =
      missing <= 0
        ? []
        : (
            await read(
              { and: [matching(wanted), { passengersPerYear: { exists: false } }] },
              'city',
              missing,
            )
          ).docs

    const found: RankedAirport[] = [...ranked.docs, ...rest].map((airport) => ({
      id: airport.id,
      passengersPerYear: airport.passengersPerYear,
      city: inLocale(airport.city as Translated, locale),
      country: inLocale(airport.country as Translated, locale),
      // `label` is what the option format calls the airport's own name (src/lib/airports.ts).
      label: inLocale(airport.name as Translated, locale),
      icao: airport.icao,
      iata: airport.iata,
    }))

    return rankAirports(found, limit).map((airport) => airportOption(airport))
  } catch (error) {
    // The legacy search answered with the term alone on any error, so the field stayed usable.
    console.warn('[airports] the search could not be run, so the field offers nothing.', error)
    return []
  }
}
