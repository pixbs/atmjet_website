import type { MetadataRoute } from 'next'

import type { Locale } from '@/i18n/locales'

import { servedLocales } from './pages'
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
  /** The languages it answers in; none named means every one the site serves (issue #149). */
  availableLocales?: string[] | null
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
      .flatMap((page) => {
        // A page served in fewer languages is listed in fewer, and canonical in the first of
        // them: the Russian-only citizens page is a Russian URL, not an English one (#149).
        const served = servedLocales(page.availableLocales, locales)
        const [primary = canonical] = served

        return [
          {
            url: localeUrl(origin, primary, page.slug),
            // When an editor last changed it, rather than the legacy's build time.
            lastModified: page.updatedAt ?? undefined,
            changeFrequency: 'daily' as const,
            // The home page is the one a crawler should come back to first.
            priority: page.slug === '' ? 1 : 0.8,
            alternates: { languages: localeUrls(origin, served, page.slug) },
          },
        ]
      })
  )
}

/**
 * One entry per document of a catalogue served under a listing: `/en/aircraft/<slug>` and
 * `/en/yachts/<slug>` (issue #171).
 *
 * The legacy `aircraft/sitemap.xml` enumerated the `vehicles` table into unprefixed URLs that
 * only answer through a redirect, and the charter fleet had no sitemap at all
 * (`docs/legacy-inventory.md` section 2.3). A catalogue answers in every language the site
 * serves, so each entry carries the same alternates a page does.
 */
export function detailEntries(
  origin: string,
  locales: readonly Locale[],
  listing: string,
  documents: readonly Listable[],
): MetadataRoute.Sitemap {
  const [canonical] = locales
  if (!canonical) return []

  return documents.flatMap((document) => {
    // A row the import has not given a slug yet has no URL, exactly as on the listing card.
    const slug = (document.slug ?? '').trim()
    if (slug === '') return []

    const path = `${listing}/${slug}`

    return [
      {
        url: localeUrl(origin, canonical, path),
        lastModified: document.updatedAt ?? undefined,
        // A fleet changes when an aircraft joins or leaves it, not daily as an edited page does.
        changeFrequency: 'weekly' as const,
        // Below the pages that link to them: a detail page is reached through its listing.
        priority: 0.5,
        alternates: { languages: localeUrls(origin, locales, path) },
      },
    ]
  })
}
