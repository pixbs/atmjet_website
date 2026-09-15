import { z } from 'zod'

import { legSchema } from './flight-request'
import {
  isSubmittableEmail,
  isSubmittablePhone,
  LEAD_FORM_TYPES,
  LEAD_NAME_MAX_LENGTH,
  LEAD_TAG_MAX_LENGTH,
  LEAD_TAGS_MAX,
} from './leads'
import { ALL_LOCALES } from '@/i18n/locales'

/**
 * What the booking form asks for, and what a submission of it is allowed to say (issues #152
 * and #154, `docs/legacy-inventory.md` section 7.2).
 *
 * The three rules are the legacy zod schema, and they are the collection's rules as well
 * (`src/lib/leads.ts`): a name of at most thirty-two characters, an address with an at-sign in
 * it, and between eight and fifteen digits however they are punctuated. One set of rules, so a
 * submission the form accepts is one the collection accepts.
 *
 * What the legacy left unbounded is bounded here — the address, the chips and the legs — because
 * a lead is only useful once it has been delivered, and a message too long for Telegram fails on
 * every attempt the job makes rather than arriving late.
 */
export const bookingSchema = z.object({
  name: z.string().trim().min(1).max(LEAD_NAME_MAX_LENGTH),
  email: z.string().trim().refine(isSubmittableEmail, 'email'),
  phone: z.string().trim().refine(isSubmittablePhone, 'phone'),
  tags: z.array(z.string().trim().max(LEAD_TAG_MAX_LENGTH)).max(LEAD_TAGS_MAX).optional(),
})

export type Booking = z.infer<typeof bookingSchema>

/** As long as a URL is worth keeping; anything longer is somebody being clever. */
const URL_MAX = 2048

/**
 * A day, as the longest elapsed time worth believing: a tab left open overnight sends a number
 * nothing can be concluded from. A number outside the range is dropped rather than floored to
 * nought, which the floor under it would have read as the fastest submission there is and
 * refused — turning a stale tab into a lost lead.
 */
const MAX_ELAPSED_MS = 24 * 60 * 60 * 1000

/**
 * A whole submission, as it arrives at the server action. Every field is checked there rather
 * than trusted: a server action is a public endpoint, whatever calls it in the browser.
 */
export const submissionSchema = z.object({
  values: bookingSchema,
  formType: z.enum(LEAD_FORM_TYPES),
  /** The `?showBooking=` value that opened the form, which the lead is traced back through. */
  source: z.string().trim().max(64).optional(),
  locale: z.enum(ALL_LOCALES),
  /** The page it was submitted from, as the browser knows it. */
  url: z.string().trim().max(URL_MAX),
  /** The legs of a flight request, where one was handed over (section 7.6). */
  directions: z.array(legSchema).max(4).optional(),
  /** How long the form was on screen before it was sent, and the honeypot (issue #157). */
  elapsedMs: z.number().int().nonnegative().max(MAX_ELAPSED_MS).optional().catch(undefined),
  trap: z.string().max(LEAD_NAME_MAX_LENGTH).optional(),
})

export type LeadSubmission = z.infer<typeof submissionSchema>

/**
 * The legs a booking form was opened with. The legacy form read them with a bare
 * `JSON.parse(searchParams.get('direction'))`, so a malformed query threw while the page was
 * rendering and took the whole page down (section 13, entry 67); here it is no legs.
 */
export function parseDirections(raw: string | null): LeadSubmission['directions'] {
  if (raw === null || raw === '') return undefined

  try {
    const parsed = z.array(legSchema).max(4).safeParse(JSON.parse(raw))

    return parsed.success ? parsed.data : undefined
  } catch {
    return undefined
  }
}

/** The campaign parameters on the page a form was submitted from. */
export function campaignOf(url: string): Record<string, string> {
  try {
    const { searchParams } = new URL(url)
    const utm: Record<string, string> = {}

    for (const key of ['source', 'medium', 'campaign', 'term', 'content']) {
      const value = searchParams.get(`utm_${key}`)
      if (value !== null && value !== '') utm[key] = value.slice(0, 256)
    }

    return utm
  } catch {
    return {}
  }
}
