import type { Payload, Where } from 'payload'

import { DEFAULT_LOCALE, type Locale } from '@/i18n/locales'
import {
  airportOption,
  airportSearchText,
  rankAirports,
  SEARCH_LIMIT,
  searchTerms,
  termCode,
  type RankedAirport,
} from '@/lib/airports'

import { getPayloadClient } from './payload'

/**
 * The airports a term matches, as the autocomplete lists them (issues #159 and #443).
 *
 * The legacy search (`docs/legacy-inventory.md` sections 8.5 and 8.6) matched ten columns with
 * one `ILIKE '%term%'` and patched its misses one at a time: `st` re-queried as `saint`, a
 * title-cased term because the database did not fold Cyrillic, a hard-coded Bilbao. Here every
 * airport carries one folded text of all its names, languages and codes (`airportSearchText`,
 * kept by the collection hook), and every word of an equally folded term has to occur in it, so
 * case, ё, accents, punctuation, the saints, the script and the field a word is in stop mattering.
 *
 * Each result is named in the language of the page, falling back as the legacy template's
 * `ru || en` did. It reads its pools separately because Postgres sorts nulls first on a
 * descending order: the airports whose traffic is known come back ranked, and the rest join them
 * for `rankAirports` to order by how closely they match.
 */

/** What one line of the list needs, and what ranks it. */
const SELECT = {
  city: true,
  country: true,
  name: true,
  aliases: true,
  icao: true,
  iata: true,
  passengersPerYear: true,
} as const

/** How many matches each read brings back for the ranking to choose the list from. */
const POOL = 60

/** A localized field read with `locale: 'all'`: one value per language. */
type Translated = Partial<Record<Locale, string | null>> | string | null | undefined

/** The value in the language being read, else the default one, else any, as `ru || en` chose. */
function inLocale(value: Translated, locale: Locale): string | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') return value

  return value[locale] || value[DEFAULT_LOCALE] || Object.values(value).find(Boolean) || null
}

/** Throws when the airports cannot be read, so the endpoint can answer without caching it. */
export async function searchAirports(
  { term, locale, limit = SEARCH_LIMIT }: { term: string; locale: Locale; limit?: number },
  // Injected so the integration tier can read through its own Payload instance.
  client: () => Promise<Payload> = getPayloadClient,
): Promise<string[]> {
  const terms = searchTerms(term)
  if (terms.length === 0) return []

  const payload = await client()
  const read = (where: Where, sort: string) =>
    payload.find({
      collection: 'airports',
      // Every language at once, to name each airport in the page's and to rank it on all.
      locale: 'all',
      where,
      sort,
      limit: POOL,
      depth: 0,
      select: SELECT,
      pagination: false,
      // Only what a visitor can read: the field is offered before anyone signs in.
      overrideAccess: false,
    })

  // Every word, in one of its spellings; a folded word holds no space or wildcard to split on.
  const matching: Where = {
    and: terms.map((spellings) => ({ or: spellings.map((word) => ({ search: { like: word } })) })),
  }
  const code = termCode(terms)

  const [exact, ranked, rest] = await Promise.all([
    code === undefined
      ? { docs: [] }
      : read(
          { or: [{ icao: { equals: code } }, { iata: { equals: code } }] },
          '-passengersPerYear',
        ),
    read({ and: [matching, { passengersPerYear: { exists: true } }] }, '-passengersPerYear'),
    read({ and: [matching, { passengersPerYear: { exists: false } }] }, 'city'),
  ])

  const found: RankedAirport[] = [...exact.docs, ...ranked.docs, ...rest.docs].map((airport) => ({
    id: airport.id,
    passengersPerYear: airport.passengersPerYear,
    city: inLocale(airport.city as Translated, locale),
    country: inLocale(airport.country as Translated, locale),
    // `label` is what the option format calls the airport's own name (src/lib/airports.ts).
    label: inLocale(airport.name as Translated, locale),
    icao: airport.icao,
    iata: airport.iata,
    search: airportSearchText(airport),
  }))

  return rankAirports(found, limit, term).map((airport) => airportOption(airport))
}
