/**
 * Airports: how a code is stored and how one reads in a list.
 *
 * The two legacy airport tables spelled the same codes in whatever case the source used
 * (`docs/legacy-inventory.md` section 8.5); the collection hook runs the normalisers so a code
 * is stored one way whichever table it came from, and the search lists what it finds through
 * `airportOption`.
 */

/**
 * ICAO and IATA codes, canonical: trimmed, inner whitespace removed, upper-cased. An empty or
 * absent value becomes undefined rather than an empty string, so a missing code is missing
 * rather than a value that matches nothing.
 */
export function normaliseCode(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined

  const normalised = value.replace(/\s+/g, '').toUpperCase()
  return normalised === '' ? undefined : normalised
}

/** Collapses runs of whitespace and trims, leaving human text otherwise untouched. */
export function normaliseText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined

  const normalised = value.replace(/\s+/g, ' ').trim()
  return normalised === '' ? undefined : normalised
}

/** An airport as the search offers it, narrowed to what one line of the list needs. */
export interface AirportOption {
  city?: string | null
  country?: string | null
  /** The airport's own name, which the legacy row called `label`. */
  label?: string | null
  icao?: string | null
  iata?: string | null
}

/**
 * `Dubai (OMDB) United Arab Emirates, Dubai International`: one airport as the legacy
 * autocomplete listed it (`docs/legacy-inventory.md` section 8.5). ICAO, or IATA where an
 * airport has no ICAO code.
 *
 * The legacy template left the gap where a missing code would have gone — `Dubai  United Arab
 * Emirates` with two spaces — and printed a bare comma for an airport with no name; what is
 * absent is simply left out here.
 */
export function airportOption(airport: AirportOption): string {
  const code = normaliseCode(airport.icao) ?? normaliseCode(airport.iata)
  const head = [
    normaliseText(airport.city),
    code === undefined ? undefined : `(${code})`,
    normaliseText(airport.country),
  ]
    .filter((part) => part !== undefined)
    .join(' ')
  const name = normaliseText(airport.label)

  if (head === '') return name ?? ''
  return name === undefined ? head : `${head}, ${name}`
}

/**
 * The airport search (issue #159, `docs/legacy-inventory.md` section 8.5).
 *
 * Below two characters the legacy search returned nothing but the term itself, so a single
 * letter never queried the table; that bound is kept, because a letter matches thousands of
 * rows in ten columns.
 */
export const MIN_SEARCH_LENGTH = 2

/** How many options the list offers. The legacy query took twenty before de-duplicating. */
export const SEARCH_LIMIT = 20

/**
 * One row per airport a visitor would call the same thing: the legacy search returned Dubai
 * twice, once from each of the two tables it had merged, and de-duplicated on the city and the
 * two codes. An airport with neither code and no city cannot be told apart from another, so the
 * first of those wins, as it did there.
 *
 * Not exported: `rankAirports` is the only way to ask, so a caller cannot rank a list it has not
 * de-duplicated (ADR-0008).
 */
function dedupeAirports<T extends AirportOption>(airports: readonly T[]): T[] {
  const seen = new Set<string>()

  return airports.filter((airport) => {
    const key = [
      normaliseText(airport.city)?.toLowerCase() ?? '',
      normaliseCode(airport.icao) ?? '',
      normaliseCode(airport.iata) ?? '',
    ].join('|')
    if (seen.has(key)) return false

    seen.add(key)
    return true
  })
}

/** An airport as the search ranks them: the option's fields, which airport it is, and how busy. */
export interface RankedAirport extends AirportOption {
  id?: number | string
  passengersPerYear?: number | null
}

/**
 * The busiest airports first (issue #159). The legacy search ordered by `passengers_per_year`,
 * a text column, ascending, so the smallest airports came first and `9` sorted above `1000000`
 * (`docs/legacy-inventory.md` section 13, entry 69).
 *
 * An airport whose traffic nobody recorded goes last rather than first, which is what a database
 * sorting nulls first would do with the same column, and the order it arrived in is kept among
 * equals so the two languages a term was matched in do not shuffle between keystrokes.
 */
export function rankAirports<T extends RankedAirport>(airports: readonly T[], limit: number): T[] {
  const traffic = (airport: T): number =>
    typeof airport.passengersPerYear === 'number' && Number.isFinite(airport.passengersPerYear)
      ? airport.passengersPerYear
      : -1

  return dedupeAirports(airports)
    .map((airport, index) => ({ airport, index }))
    .sort((one, two) => traffic(two.airport) - traffic(one.airport) || one.index - two.index)
    .slice(0, Math.max(0, limit))
    .map((entry) => entry.airport)
}
