/**
 * Normalisation for airport data (issue #64).
 *
 * The legacy site held two airport tables with the same facts spelled differently: `airports`
 * stored everything as `varchar(255)` and `new_airports` as `text`, codes arrived in whatever
 * case the source used, and `passengers_per_year` was text, so the autocomplete ordered by it
 * lexicographically and ranked "9" above "1000000"
 * (`docs/legacy-inventory.md` section 8.5). These functions are what the import of E5.5 and the
 * collection hook both run, so a code is stored one way whichever table it came from.
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

/**
 * `passengers_per_year` as a number. The legacy column is text and the values arrive with
 * thousands separators of several kinds, so anything that is not a digit is dropped before
 * parsing. A value that holds no digits at all is undefined, not zero: an unknown passenger
 * count must not rank as the quietest airport.
 */
export function parsePassengersPerYear(value: unknown): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? Math.trunc(value) : undefined
  if (typeof value !== 'string') return undefined

  const digits = value.replace(/[^0-9]/g, '')
  if (digits === '') return undefined

  const parsed = Number.parseInt(digits, 10)
  return Number.isSafeInteger(parsed) ? parsed : undefined
}

/**
 * Latitude and longitude, which the legacy `airports` table also stored as text. A value
 * outside the real range is rejected rather than stored, because a bad coordinate silently
 * places an airport in the sea.
 */
export function parseCoordinate(value: unknown, limit: 90 | 180): number | undefined {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value ?? '').trim())

  if (!Number.isFinite(parsed) || Math.abs(parsed) > limit) return undefined

  return parsed
}
