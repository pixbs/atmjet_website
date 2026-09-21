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
  /**
   * The pages say what their translations are, not the proxy (issue #168).
   *
   * next-intl offers the same thing as a `Link` response header, but it knows only the routing:
   * it named an unprefixed `x-default` — the shape of URL the legacy sitemap advertised and a
   * crawler is redirected from (`docs/legacy-inventory.md` section 2.3) — and an English
   * alternate for the Russian-only citizens page, whose English URL redirects. Every route
   * already emits the right set from `generateMetadata`, which reads `availableLocales`, so the
   * header was a second answer that disagreed with the first.
   */
  alternateLinks: false,
})
