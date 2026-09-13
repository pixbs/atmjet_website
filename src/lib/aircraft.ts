/**
 * Aircraft value handling (issue #63).
 *
 * Two legacy details drive this file. Registrations are matched between the `aircrafts` and
 * `vehicles` tables on `upper(replace(x, '-', ''))` (`docs/legacy-inventory.md` section 8), so
 * the same rule has to exist here or E5.7 will merge the wrong rows. And the cabin dimensions
 * are Postgres `real` columns that the legacy pages rendered by casting to text, so reproducing
 * that text exactly is a visual-parity requirement, not a formatting preference.
 */

/**
 * A registration as the legacy comparison saw it: upper-cased, with hyphens and whitespace
 * removed, so `RA-73025`, `ra 73025` and `RA73025` are one aircraft.
 *
 * Only the separators the data actually contains are stripped. Anything else is left in place,
 * because silently deleting a character would merge two aircraft that are not the same.
 */
export function canonicalRegistration(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined

  const canonical = value.replace(/[\s-]/g, '').toUpperCase()
  return canonical === '' ? undefined : canonical
}

/**
 * The text Postgres produces for a `real` column.
 *
 * `real` is a 32-bit float and Postgres prints the shortest decimal that reads back as the same
 * 32-bit value. A number that has been through JavaScript is a 64-bit float, so printing it
 * directly gives `1.7999999523162842` where the legacy page showed `1.8`. Rounding to 32 bits
 * first and then finding the shortest representation that survives the round trip reproduces
 * what the visitor actually saw.
 */
export function formatLegacyReal(value: unknown): string | undefined {
  const input = typeof value === 'number' ? value : Number.parseFloat(String(value ?? ''))
  if (!Number.isFinite(input)) return undefined

  const asFloat32 = Math.fround(input)

  // Eight or fewer significant digits usually suffice; nine always round-trip a 32-bit float,
  // so that is the last step rather than an unreachable fallback after the loop.
  for (let precision = 1; precision <= 8; precision += 1) {
    const candidate = Number.parseFloat(asFloat32.toPrecision(precision))
    if (Math.fround(candidate) === asFloat32) return String(candidate)
  }

  return String(Number.parseFloat(asFloat32.toPrecision(9)))
}

/**
 * The text Postgres produces for an `integer` column. Separate from the `real` case because a
 * whole number must never pick up a decimal point or a thousands separator: the legacy pages
 * printed the raw cast.
 */
export function formatLegacyInteger(value: unknown): string | undefined {
  const input = typeof value === 'number' ? value : Number.parseInt(String(value ?? ''), 10)
  if (!Number.isFinite(input)) return undefined

  return String(Math.trunc(input))
}

/**
 * Which detail layout an aircraft gets. The legacy site fell back to a sparser page when the
 * catalogue had no row or no images (`docs/legacy-inventory.md` section 4), so the choice
 * follows the image count and is never stored: a document that gains images gains the rich
 * layout without anybody editing a field.
 */
export function detailLayoutFor(imageCount: number): 'rich' | 'basic' {
  return imageCount > 1 ? 'rich' : 'basic'
}
