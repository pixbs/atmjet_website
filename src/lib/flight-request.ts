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

/** A charter of more than a fortnight is a conversation, not a form (issue #140). */
const HOURS_MAX = 24 * 14

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

/**
 * A leg as it travels in the `?direction=` query and is recorded on the lead (section 7.6).
 *
 * Every field is optional because each form that writes one fills in a different set: the
 * flight request names where and when and how many passengers, and the yacht detail page names
 * how many guests and for how many hours (issue #140). The Leads collection and the Telegram
 * message have carried all seven since #152; this is the shape they were carried in.
 */
export const directionSchema = legSchema.partial().extend({
  guests: z.number().int().positive().max(PASSENGERS_MAX).optional(),
  hours: z.number().int().positive().max(HOURS_MAX).optional(),
})

export type Direction = z.infer<typeof directionSchema>

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

/** The two detail pages that hand a leg to the dialog, as a lead records them. */
const DETAIL_PAGES = { aircraft: 'Aircraft_detail', yacht: 'Yachts_detail' } as const

export type DetailPage = keyof typeof DETAIL_PAGES

/**
 * What a detail page calls itself when it opens the dialog (issue #153).
 *
 * The legacy action wrote `showBooking=Yachts` from both pages, so every lead from the
 * catalogue said the same thing and none of them said which aircraft or yacht it was about
 * (`docs/legacy-inventory.md` section 13, entry 30). The page says which it is, and the slug
 * it is served at says which vehicle, so the desk reads both off the lead.
 *
 * The slug rather than the name: it is what the URL already carries, it is unique, and it
 * cannot bring a quotation mark into the Telegram message the way `Azimut "Serenity"` would.
 */
export function detailSource(page: DetailPage, slug: string): string {
  const named = slug.trim()

  return named === '' ? DETAIL_PAGES[page] : `${DETAIL_PAGES[page]}:${named}`
}
