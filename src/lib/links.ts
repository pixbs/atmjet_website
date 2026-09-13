/**
 * The external destinations the chrome links to, built from the values an editor keeps in
 * `SiteSettings` (issue #61).
 *
 * The legacy site hard-coded every one of them in six components at once
 * (`docs/legacy-inventory.md` section 9.5), which is how it ended up with a Telegram channel
 * link written as `tg:\\nesolve?domain=@atmjet1`: literal backslashes, a misspelled verb and a
 * scheme no browser follows (section 13). Building the URLs in one place from a bare handle
 * means an editor never types a scheme, so that class of typo cannot come back.
 *
 * Every builder accepts what an editor is likely to paste — a handle, an `@handle` or the full
 * page URL — and returns the canonical form, or an empty string when the value holds nothing to
 * link to.
 */

/** The networks the chrome can link to. `SiteSettings` holds one handle per network. */
export const SOCIAL_NETWORKS = ['telegram', 'whatsapp', 'instagram'] as const

export type SocialNetwork = (typeof SOCIAL_NETWORKS)[number]

/** Strips the `@`, a scheme and any host an editor pasted, leaving the account segment. */
function handleOf(value: string): string {
  const withoutScheme = value
    .trim()
    .replace(/^@/, '')
    .replace(/^[a-z][a-z\d+.-]*:(\/\/)?/i, '')
  return withoutScheme.split(/[/?#]/).filter(Boolean).at(-1) ?? ''
}

/** Digits only, which is what `tel:` and `wa.me` want. */
function digitsOf(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * `tel:+971504589926` from `+971 (50) 458-99-26`.
 *
 * The legacy dialler and the number on screen were two different phones; the displayed one is
 * the correct one (issue #61), so both now come from the same stored value.
 */
export function telHref(phone: string): string {
  const digits = digitsOf(phone)
  return digits === '' ? '' : `tel:+${digits}`
}

export function mailtoHref(email: string): string {
  const address = email.trim()
  return address === '' ? '' : `mailto:${address}`
}

/** `https://wa.me/971504589926`: wa.me takes the number in full international form, without `+`. */
export function whatsAppHref(phone: string): string {
  const digits = digitsOf(phone)
  return digits === '' ? '' : `https://wa.me/${digits}`
}

/**
 * `https://t.me/melentev1`. Channels and accounts share the `t.me` namespace, so the empty-legs
 * channel link the legacy site could not open is built exactly like the rest.
 */
export function telegramHref(account: string): string {
  const handle = handleOf(account)
  return handle === '' ? '' : `https://t.me/${handle}`
}

/** `https://www.instagram.com/atmjet/`, trailing slash included as the legacy links had it. */
export function instagramHref(account: string): string {
  const handle = handleOf(account)
  return handle === '' ? '' : `https://www.instagram.com/${handle}/`
}
