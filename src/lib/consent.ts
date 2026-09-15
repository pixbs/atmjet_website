/**
 * What a visitor has agreed to be tracked with (issue #91, `docs/legacy-inventory.md` section
 * 3.7).
 *
 * The legacy site asked the question and then ignored the answer: Google Tag Manager, Vercel
 * Analytics and Speed Insights all loaded whatever was clicked (section 13, entry 71). It also
 * wrote session cookies from the banner and year-long ones from the modal, so a visitor who used
 * the banner was asked again on their next visit. Both are fixed here: the answer decides what
 * loads, and every answer is kept for the same length of time.
 */

/** The three cookies the legacy site wrote, by the names it wrote them under. */
const CONSENT_COOKIE = 'cookie-consent'
const MARKETING_COOKIE = 'marketing-consent'
const PERSONAL_COOKIE = 'personal-consent'

/** What the legacy modal used: `60 * 525960` seconds, a quarter-day over a year. */
const CONSENT_MAX_AGE = 60 * 525_960

export interface Consent {
  /** Google Tag Manager, and anything else that measures a visit. */
  marketing: boolean
  /** What the legacy called personal cookies; nothing reads it yet. */
  personal: boolean
}

export const ACCEPT_ALL: Consent = { marketing: true, personal: true }
export const REJECT_ALL: Consent = { marketing: false, personal: false }

const value = (cookies: string, name: string): string | undefined =>
  cookies
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.slice(name.length + 1)

/**
 * What a visitor has already answered, or nothing at all when they have not been asked. Reads a
 * `document.cookie` string, so the rule is one function rather than one per caller.
 */
export function readConsent(cookies: string): Consent | null {
  if (value(cookies, CONSENT_COOKIE) !== 'true') return null

  return {
    marketing: value(cookies, MARKETING_COOKIE) === 'true',
    personal: value(cookies, PERSONAL_COOKIE) === 'true',
  }
}

/**
 * The three cookies an answer is written as, ready for `document.cookie`. `SameSite=Lax` and the
 * whole site as the path, which is what the legacy wrote; the difference is that the banner's
 * answer now lasts as long as the modal's.
 */
export function consentCookies(consent: Consent): string[] {
  return [
    [MARKETING_COOKIE, consent.marketing],
    [PERSONAL_COOKIE, consent.personal],
    [CONSENT_COOKIE, true],
  ].map(([name, allowed]) => `${name}=${allowed}; Max-Age=${CONSENT_MAX_AGE}; Path=/; SameSite=Lax`)
}

/** What Google calls each thing a tag may do, and which of the two answers decides it. */
const SIGNALS = {
  ad_storage: 'marketing',
  ad_user_data: 'marketing',
  ad_personalization: 'marketing',
  analytics_storage: 'marketing',
  personalization_storage: 'personal',
} as const

/**
 * The answer in the words Google Consent Mode reads (issue #174). The two the modal calls
 * necessary are granted throughout: they are what carries the answer itself and the session, and
 * the legacy modal listed them as required rather than as a choice
 * (`docs/legacy-inventory.md` section 3.7).
 */
export function consentSignals(consent: Consent): Record<string, 'granted' | 'denied'> {
  const state = (allowed: boolean) => (allowed ? 'granted' : 'denied')

  return {
    ...Object.fromEntries(
      Object.entries(SIGNALS).map(([signal, answer]) => [signal, state(consent[answer])]),
    ),
    functionality_storage: 'granted',
    security_storage: 'granted',
  }
}
