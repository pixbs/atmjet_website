/**
 * The two legacy airport tables spelled the same codes in whatever case the source used
 * (`docs/legacy-inventory.md` section 8.5); the collection hook runs these so a code is stored
 * one way whichever table it came from.
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
