import type { ListingContract, ListingQuery } from './listing'

/**
 * Registrations are matched between the legacy `aircrafts` and `vehicles` tables on
 * `upper(replace(x, '-', ''))` (`docs/legacy-inventory.md` section 8), so the same rule has to
 * exist here or the import (E5.7) merges the wrong rows.
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
 * What the aircraft listing sorts by (issue #135, `docs/legacy-inventory.md` section 4). `size`
 * is the cabin height the legacy sorted on under that name; `passengers` is the option whose
 * value was spelt `passangers` and so never matched, leaving the list in id order (section 13,
 * entry 23).
 */
export const AIRCRAFT_SORTS = ['size', 'passengers', 'range'] as const

export type AircraftSort = (typeof AIRCRAFT_SORTS)[number]

/** The listing opens on size ascending and reads fifteen at a time, as the legacy list did. */
export const AIRCRAFT_LISTING: ListingContract<AircraftSort> = {
  sorts: AIRCRAFT_SORTS,
  direction: 'asc',
  perPage: 15,
  maxPerPage: 60,
}

export type AircraftQuery = ListingQuery<AircraftSort>
