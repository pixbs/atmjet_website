import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'

import { routing } from './routing'

/**
 * Resolves the locale and loads its messages on the server for every request
 * (ADR-0007: no client-side locale logic beyond the switcher).
 *
 * An unknown locale falls back to the default here rather than throwing; the proxy has
 * already rejected prefixes that are not routed, so this path is only reached for requests
 * that carry no locale segment at all.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
