import type { Locale } from '@/i18n/locales'

/**
 * Where a page lives (issues #171, #170). The legacy site built URLs in each file that needed
 * one, from `VERCEL_PROJECT_PRODUCTION_URL` with the scheme glued on and the locale left off, so
 * its sitemap advertised paths that only answer with a redirect
 * (`docs/legacy-inventory.md` section 2.3).
 */

/** The canonical origin, without a trailing slash, from the variable `payload.config.ts` reads. */
export function siteOrigin(configured = process.env.NEXT_PUBLIC_SITE_URL): string {
  return (configured || 'http://localhost:3000').replace(/\/+$/, '')
}

/** The URL a page is served at: `/en` for the home page, `/en/empty_legs` for the rest. */
export function localeUrl(origin: string, locale: Locale, slug: string): string {
  return slug === '' ? `${siteOrigin(origin)}/${locale}` : `${siteOrigin(origin)}/${locale}/${slug}`
}

/**
 * The URL of a page in each locale the site serves, plus `x-default` for a visitor whose
 * language is none of them. It is what a sitemap lists as `alternates` and what a page emits as
 * `hreflang`; the legacy site had neither, and no `x-default` anywhere.
 *
 * Slugs are not localized (`src/collections/Pages.ts`): one page is one URL per locale.
 */
export function localeUrls(
  origin: string,
  locales: readonly Locale[],
  slug: string,
): Record<string, string> {
  const [canonical] = locales
  if (!canonical) return {}

  return Object.fromEntries([
    ...locales.map((locale) => [locale, localeUrl(origin, locale, slug)]),
    ['x-default', localeUrl(origin, canonical, slug)],
  ])
}
