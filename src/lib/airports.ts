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
