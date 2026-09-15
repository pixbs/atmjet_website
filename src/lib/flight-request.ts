import { z } from 'zod'

/**
 * The flight request a visitor builds before anyone asks their name (issue #151,
 * `docs/legacy-inventory.md` sections 7.1 and 7.6): one to four legs, or one leg there and back.
 *
 * The rules are the legacy zod schema, kept as they were so that a request the legacy site
 * accepted is accepted here. What changes is that a request it refused is now said out loud:
 * the legacy form rendered no errors at all, so an invalid submit did nothing and said nothing
 * (section 13, entry 64).
 */

/** The most legs the legacy form offered to add. */
export const MAX_LEGS = 4

/**
 * What a leg may carry. The legacy schema bounded none of it, which matters once a leg is on its
 * way to Telegram: a message too long to send fails on every attempt (`src/lib/leads.ts`). An
 * airport reads `Dubai (OMDB) United Arab Emirates, Dubai International`, so 128 is room to
 * spare; the passengers are the counter's own range (`src/components/ui/counter-input.tsx`).
 */
const AIRPORT_MAX_LENGTH = 128
const PASSENGERS_MAX = 25

/** A date the browser's date field produced, which is what `Date.parse` was given. */
const isDate = (value: string) => !Number.isNaN(Date.parse(value))

export const legSchema = z.object({
  from: z.string().trim().min(1, 'from').max(AIRPORT_MAX_LENGTH),
  // The legacy destination is optional: a request may name only where it starts.
  to: z.string().trim().max(AIRPORT_MAX_LENGTH).optional(),
  date: z.string().trim().min(1, 'date').refine(isDate, 'date'),
  returnDate: z
    .string()
    .trim()
    .refine((value) => value === '' || isDate(value), 'date')
    .optional(),
  passengers: z.number().int().positive().max(PASSENGERS_MAX),
})

export const flightRequestSchema = z.object({ legs: z.array(legSchema).min(1).max(MAX_LEGS) })

export type FlightLeg = z.infer<typeof legSchema>
export type FlightRequest = z.infer<typeof flightRequestSchema>

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
export function handoffQuery(legs: readonly FlightLeg[], source = 'Flight_request'): string {
  const direction = legs.map((leg) => ({
    ...leg,
    to: leg.to === '' ? undefined : leg.to,
    returnDate: leg.returnDate === '' ? undefined : leg.returnDate,
  }))

  return `?showBooking=${source}&direction=${encodeURIComponent(JSON.stringify(direction))}`
}
