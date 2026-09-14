import type { MetadataRoute } from 'next'

import type { Locale } from '@/i18n/locales'

/**
 * The URLs `/sitemap.xml` offers a crawler (issue #171).
 *
 * The legacy sitemap was a hand-written list of paths, which is how it came to advertise
 * `/citezens`, leave `/sales_yachts` out and point at unprefixed URLs that only resolve through
 * a redirect (`docs/legacy-inventory.md` section 2.3). Everything here is derived from the pages
 * an editor owns, so a page they add is listed and a path they never created cannot be.
 */

type SitemapEntry = MetadataRoute.Sitemap[number]
type SitemapLanguages = NonNullable<NonNullable<SitemapEntry['alternates']>['languages']>

/** A document a sitemap can list: something served at a slug, with a last change. */
export interface Listable {
  slug?: string | null
  updatedAt?: string | null
}

/**
 * The canonical origin, without a trailing slash. The legacy `robots.txt` wrote the host into
 * the source, so a preview advertised production's sitemap; this reads the environment the
 * Payload server URL already comes from.
 */
export function siteOrigin(configured = process.env.NEXT_PUBLIC_SITE_URL): string {
  return (configured || 'http://localhost:3000').replace(/\/+$/, '')
}

/** The URL a page is served at: `/en` for the home page, `/en/empty_legs` for the rest. */
function localeUrl(origin: string, locale: Locale, slug: string): string {
  return slug === '' ? `${siteOrigin(origin)}/${locale}` : `${siteOrigin(origin)}/${locale}/${slug}`
}

/**
 * One entry per page, canonical in the first locale the site serves and carrying an alternate
 * for each of the others plus `x-default`, which is the form Next documents for a localized
 * sitemap and what Google reads as a language set. The legacy entries listed unprefixed URLs
 * and no `x-default` at all, so a crawler was handed a redirect instead of a page.
 *
 * Slugs are not localized (`src/collections/Pages.ts`): one page is one URL per locale.
 */
export function pageEntries(
  origin: string,
  locales: readonly Locale[],
  pages: readonly Listable[],
): MetadataRoute.Sitemap {
  const [canonical] = locales
  if (!canonical) return []

  return (
    pages
      // A page an editor has not given a slug to has no URL yet, exactly as in `listPageParams`.
      .filter((page): page is Listable & { slug: string } => typeof page.slug === 'string')
      .map((page) => {
        const languages: SitemapLanguages = { 'x-default': localeUrl(origin, canonical, page.slug) }
        for (const locale of locales) languages[locale] = localeUrl(origin, locale, page.slug)

        return {
          url: localeUrl(origin, canonical, page.slug),
          // When an editor last changed it, rather than the legacy's build time.
          lastModified: page.updatedAt ?? undefined,
          changeFrequency: 'daily' as const,
          // The home page is the one a crawler should come back to first.
          priority: page.slug === '' ? 1 : 0.8,
          alternates: { languages },
        }
      })
  )
}
