/**
 * Empty legs (issue #66).
 *
 * Two legacy behaviours drive this file. The card rendered the departure date with
 * `new Date(start).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })`
 * — always en-US, whatever language the visitor was reading (`docs/legacy-inventory.md` section 6,
 * EmptyLegCard) — and the legacy runtime was UTC, so the day it printed was the UTC day of a
 * `timestamptz`. Both are reproduced here rather than left to the server's time zone.
 */

/** The locale the legacy card formatted with, regardless of the page's own locale. */
export const LEGACY_DATE_LOCALE = 'en-US'

/**
 * The options the legacy card passed, plus the time zone it did not.
 *
 * `toLocaleDateString` without a `timeZone` uses the runtime's, so the same row printed
 * "March 5, 2025" on a UTC server and "March 4, 2025" on one in Los Angeles. Pinning UTC keeps
 * the day the legacy deployment showed and makes the output the same everywhere it renders.
 */
export const LEGACY_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
}

/** A date from whatever the database or an importer hands over, or nothing if it is not one. */
export function parseDeparture(value: unknown): Date | undefined {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : value
  if (typeof value !== 'string' && typeof value !== 'number') return undefined

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

/** The departure date exactly as the legacy card printed it, or nothing to print. */
export function formatDepartureDate(value: unknown): string | undefined {
  const departure = parseDeparture(value)
  if (!departure) return undefined

  return departure.toLocaleDateString(LEGACY_DATE_LOCALE, LEGACY_DATE_OPTIONS)
}

/** The instant an empty leg departs, in the form Payload stores and compares. */
export function departureIso(value: unknown): string | undefined {
  return parseDeparture(value)?.toISOString()
}

export interface OrderedEmptyLeg {
  order?: number | null
  departureAt?: string | Date | null
}

/**
 * The order the listing renders in: the `order` column first, then the departure.
 *
 * The legacy section did `select *` with no ordering at all and ignored the `order` column the
 * admin wrote (section 8, `atmjet_admin__empty_legs`), so rows came back in physical order and
 * moved whenever one was edited. A row with no `order` sorts after the ones that have one, so
 * adding a leg without thinking about the sequence puts it at the end rather than the front.
 */
export function compareEmptyLegs(a: OrderedEmptyLeg, b: OrderedEmptyLeg): number {
  const orderA = typeof a.order === 'number' ? a.order : Number.POSITIVE_INFINITY
  const orderB = typeof b.order === 'number' ? b.order : Number.POSITIVE_INFINITY
  if (orderA !== orderB) return orderA - orderB

  const departureA = parseDeparture(a.departureAt)?.getTime() ?? Number.POSITIVE_INFINITY
  const departureB = parseDeparture(b.departureAt)?.getTime() ?? Number.POSITIVE_INFINITY

  // Compared before subtracting: two legs that both lack a readable departure are both Infinity,
  // and Infinity minus Infinity is NaN, which makes Array.prototype.sort do whatever it likes.
  if (departureA === departureB) return 0

  return departureA - departureB
}

/** The sort Payload is asked for, kept next to the comparator so the two cannot drift. */
export const EMPTY_LEG_SORT: readonly string[] = ['order', 'departureAt']
