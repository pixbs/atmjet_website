import type { MetadataRoute } from 'next'

import type { Locale } from '@/i18n/locales'

import { localeUrl, localeUrls } from './urls'

/**
 * The URLs `/sitemap.xml` offers a crawler (issue #171).
 *
 * The legacy sitemap was a hand-written list of paths, which is how it came to advertise
 * `/citezens`, leave `/sales_yachts` out and point at unprefixed URLs that only resolve through
 * a redirect (`docs/legacy-inventory.md` section 2.3). Everything here is derived from the pages
 * an editor owns, so a page they add is listed and a path they never created cannot be.
 */

/** A document a sitemap can list: something served at a slug, with a last change. */
export interface Listable {
  slug?: string | null
  updatedAt?: string | null
}

/**
 * One entry per page, canonical in the first locale the site serves and carrying an alternate
 * for each of the others plus `x-default`, which is the form Next documents for a localized
 * sitemap and what Google reads as a language set. The legacy entries listed unprefixed URLs
 * and no `x-default` at all, so a crawler was handed a redirect instead of a page.
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
      .map((page) => ({
        url: localeUrl(origin, canonical, page.slug),
        // When an editor last changed it, rather than the legacy's build time.
        lastModified: page.updatedAt ?? undefined,
        changeFrequency: 'daily' as const,
        // The home page is the one a crawler should come back to first.
        priority: page.slug === '' ? 1 : 0.8,
        alternates: { languages: localeUrls(origin, locales, page.slug) },
      }))
  )
}
