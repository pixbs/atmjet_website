import { defineRouting } from 'next-intl/routing'

import { DEFAULT_LOCALE, ROUTED_LOCALES } from './locales'

/**
 * Routing contract (ADR-0003, legacy behaviour in docs/legacy-inventory.md section 2.2).
 *
 * `localePrefix: 'always'` keeps every page URL carrying its locale, exactly as the legacy
 * site did, so ported URLs stay identical. Unprefixed requests are redirected to the detected
 * locale (cookie, then `Accept-Language`, then the default), which is the legacy detection
 * order. A prefix that is not a routed locale is not recognised and therefore 404s, matching
 * the legacy treatment of `/uk/...`.
 */
export const routing = defineRouting({
  locales: ROUTED_LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'always',
})
