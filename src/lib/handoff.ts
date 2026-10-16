import type { Direction, FlightLeg } from './flight-request'

/**
 * What a form needs to hand legs to the booking dialog, kept apart from the zod schemas so a
 * form that only hands them over does not load zod with the page (issue #428).
 */

/** The most legs the legacy form offered to add. */
export const MAX_LEGS = 4

/** What a leg starts as: one passenger and nothing else, as the legacy default did. */
export const emptyLeg = (): FlightLeg => ({ from: '', to: '', date: '', passengers: 1 })

/**
 * Where the form sends a visitor once the legs are filled in: the page they are on, with the
 * query the booking dialog of E6.6 opens on (`docs/legacy-inventory.md` section 7.6).
 *
 * The legs travel as JSON in the query, as they did on the legacy site, so the dialog reads
 * them without a round trip to the server; `returnDate` is left out where it is empty rather
 * than sent as `""`, which is what the legacy round-trip form did to a one-way leg.
 */
export function handoffQuery(legs: readonly Direction[], source = 'Flight_request'): string {
  const direction = legs.map((leg) =>
    Object.fromEntries(Object.entries(leg).filter(([, value]) => value !== '')),
  )

  return `?showBooking=${source}&direction=${encodeURIComponent(JSON.stringify(direction))}`
}
