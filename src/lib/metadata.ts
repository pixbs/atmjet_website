import type { Metadata } from 'next'

import { LOCALE_DEFINITIONS, type Locale } from '@/i18n/locales'

import { localeUrl, localeUrls } from './urls'

/**
 * What a page tells a crawler and a link preview about itself (issue #170).
 *
 * The legacy site emitted almost none of this: its layout computed a title and a description
 * and then never returned them, and twelve of its routes exported no metadata at all
 * (`docs/legacy-inventory.md` section 2.4). Only the home page had a title, and no page had a
 * canonical URL or an `hreflang` link, so the same content under `/en` and `/ru` looked to a
 * crawler like two unrelated pages competing with each other.
 */
export interface PageMetadata {
  locale: Locale
  /** The locales the site serves; the first is the canonical one (`getEnabledLocales`). */
  locales: readonly Locale[]
  /** The path after the locale, empty for the home page. */
  slug: string
  title: string
  description?: string | null
  /** An absolute URL; a share image the page owns, otherwise the site's. */
  image?: string | null
  siteName: string
  origin: string
}

const openGraphLocale = (locale: Locale): string =>
  LOCALE_DEFINITIONS.find((definition) => definition.code === locale)?.openGraph ?? locale

export function pageMetadata({
  locale,
  locales,
  slug,
  title,
  description,
  image,
  siteName,
  origin,
}: PageMetadata): Metadata {
  const canonical = localeUrl(origin, locale, slug)
  const shared = { title, description: description ?? undefined }
  const images = image ? [image] : undefined

  return {
    ...shared,
    alternates: {
      // The page's own URL, so the locales stop competing for the same content.
      canonical,
      languages: localeUrls(origin, locales, slug),
    },
    openGraph: {
      ...shared,
      type: 'website',
      url: canonical,
      siteName,
      locale: openGraphLocale(locale),
      alternateLocale: locales
        .filter((alternate) => alternate !== locale)
        .map((alternate) => openGraphLocale(alternate)),
      images,
    },
    twitter: { ...shared, card: image ? 'summary_large_image' : 'summary', images },
  }
}
