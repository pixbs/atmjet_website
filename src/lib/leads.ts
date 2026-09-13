/**
 * Leads (issue #68).
 *
 * The legacy site stored nothing. `BookingForm.onSubmit` built a Markdown message and awaited
 * `sendMessage`, inside a `try { … } finally { close() }`: the dialog closed whether the send
 * succeeded or not, a failure surfaced as an unhandled rejection, and there was no second attempt
 * and no record (`docs/legacy-inventory.md` sections 7.2 and 9.1). A lost lead was simply lost.
 *
 * So the collection exists to make delivery observable, and this file holds the two things that
 * are decided rather than stored: what counts as a submittable field, and what a set of delivery
 * attempts adds up to.
 */

/** The form a submission came from. The legacy site only ever submitted through BookingForm; the
 * others fed it through the `direction` query parameter (section 7.3). */
export const LEAD_FORM_TYPES = [
  'booking-dialog',
  'contact-us-inline',
  'flight-request',
  'aircraft-detail',
  'yacht-detail',
] as const

/** Where a lead is sent. Telegram is what the legacy site used; the CRM route existed but nothing
 * called it (section 9.2). */
export const LEAD_DELIVERY_CHANNELS = ['telegram', 'crm'] as const

export const LEAD_DELIVERY_STATUSES = ['pending', 'sent', 'failed'] as const
export type LeadDeliveryStatus = (typeof LEAD_DELIVERY_STATUSES)[number]

/** The longest name the legacy form accepted (`z.string().min(1).max(32)`). */
export const LEAD_NAME_MAX_LENGTH = 32

/** The digit count the legacy phone rule allowed, before any formatting. */
export const LEAD_PHONE_MIN_DIGITS = 8
export const LEAD_PHONE_MAX_DIGITS = 15

/** How many digits a phone number carries, ignoring spaces, brackets and the leading plus. */
function phoneDigitCount(value: unknown): number {
  if (typeof value !== 'string') return 0

  return value.replace(/\D/g, '').length
}

/**
 * Whether a phone number is one the legacy form would have accepted: between 8 and 15 digits,
 * however it is punctuated. Reproduced rather than improved so a number that reached Telegram
 * before still reaches it now.
 */
export function isSubmittablePhone(value: unknown): boolean {
  const digits = phoneDigitCount(value)

  return digits >= LEAD_PHONE_MIN_DIGITS && digits <= LEAD_PHONE_MAX_DIGITS
}

/** The legacy form's e-mail rule was `z.string().email()`; this is the same shape, no stricter. */
export function isSubmittableEmail(value: unknown): boolean {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export interface DeliveryAttempt {
  channel?: unknown
  status?: unknown
  attempts?: number | null
}

/**
 * What a lead's delivery adds up to, for the admin column and for whatever retries it.
 *
 * `failed` wins over `pending`, because a lead that failed once needs looking at even while
 * another channel is still trying; `pending` wins over `sent` for the same reason in reverse.
 * A lead with no attempt recorded is `pending`: nothing has been sent, which is exactly the state
 * the legacy site left every lead in.
 */
export function deliveryStatus(
  attempts: readonly DeliveryAttempt[] | null | undefined,
): LeadDeliveryStatus {
  if (!Array.isArray(attempts) || attempts.length === 0) return 'pending'

  const statuses = attempts.map((attempt) => attempt.status)

  if (statuses.includes('failed')) return 'failed'
  if (statuses.some((status) => status !== 'sent')) return 'pending'

  return 'sent'
}
