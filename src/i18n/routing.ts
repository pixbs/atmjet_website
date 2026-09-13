import { defineRouting } from 'next-intl/routing'

import { ALL_LOCALES, DEFAULT_LOCALE } from './locales'

/**
 * Routing contract (ADR-0003, legacy behaviour in docs/legacy-inventory.md section 2.2).
 *
 * `localePrefix: 'always'` keeps every page URL carrying its locale, exactly as the legacy
 * site did, so ported URLs stay identical. Unprefixed requests are redirected to the detected
 * locale (cookie, then `Accept-Language`, then the default), which is the legacy detection
 * order.
 *
 * The list is every locale an editor can enter content for, because which of them the site
 * actually serves is `SiteSettings.enabledLocales` and changes without a deploy (issue #53).
 * `src/proxy.ts` narrows this configuration to the enabled ones per request, so a locale that
 * is not enabled is never detected and its prefix is read as an ordinary path, which 404s —
 * the legacy treatment of `/uk/...`.
 */
export const routing = defineRouting({
  locales: ALL_LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'always',
})
