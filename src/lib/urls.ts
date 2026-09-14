import type { Locale } from '@/i18n/locales'

/**
 * Where a page lives (issues #171, #170). The legacy site built URLs in each file that needed
 * one, from `VERCEL_PROJECT_PRODUCTION_URL` with the scheme glued on and the locale left off, so
 * its sitemap advertised paths that only answer with a redirect
 * (`docs/legacy-inventory.md` section 2.3).
 */

const DEVELOPMENT_ORIGIN = 'http://localhost:3000'

/**
 * The canonical origin, without a trailing slash, from the variable `payload.config.ts` reads.
 *
 * The scheme is added when the variable does not carry one. Vercel's own host variables hold a
 * bare host — `VERCEL_PROJECT_PRODUCTION_URL` is documented as being without a scheme, and the
 * legacy code wrote `https://${baseURL}` everywhere it used one (`docs/legacy-inventory.md`
 * section 14) — so a bare host is what an environment is most likely to hold. Everything else
 * tolerates one: Payload logs it and falls back, and a sitemap would merely list a relative URL.
 * `new URL` does not, and `metadataBase` is a `new URL` that runs while a page is prerendered,
 * so a bare host there fails the build rather than one page.
 */
export function siteOrigin(configured = process.env.NEXT_PUBLIC_SITE_URL): string {
  const named = (configured ?? '').trim()
  if (named === '') return DEVELOPMENT_ORIGIN

  // The scheme goes on before the trailing slash comes off, or `https://` loses its own slashes.
  const absolute = /^[a-z][a-z\d+.-]*:\/\//i.test(named) ? named : `https://${named}`
  const origin = absolute.replace(/\/+$/, '')

  try {
    new URL(origin)
    return origin
  } catch {
    console.warn(
      `[urls] NEXT_PUBLIC_SITE_URL is not an address (${named}); the site describes itself as ${DEVELOPMENT_ORIGIN}.`,
    )
    return DEVELOPMENT_ORIGIN
  }
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

/**
 * The URL the language links point at (issue #90): the path being read, with whatever the query
 * holds. The legacy switcher appended a bare `?` even when there was nothing to carry
 * (`docs/legacy-inventory.md` section 13, entry 74).
 */
export function localeSwitchHref(pathname: string, search: string): string {
  const query = search.replace(/^\?/, '')

  return query === '' ? pathname : `${pathname}?${query}`
}

/**
 * The path a card's button opens, rooted and without the empty segments the legacy produced:
 * `Link` from `@/i18n/navigation` prefixes the locale, so what it is given carries neither a
 * locale nor a repeated slash.
 *
 * The legacy `GroupCard` wrote `/${locale}/${href}` around an href that already began with one,
 * so both cards on `/atm_jet_group` linked to `/en//aircraft` (`docs/legacy-inventory.md`
 * section 13, entry 9). This takes a path, not an address: an external link is an `<a href>`.
 */
export function internalPath(href: string): string {
  const segments = href.split('/').filter((segment) => segment !== '')

  return segments.length === 0 ? '/' : `/${segments.join('/')}`
}
