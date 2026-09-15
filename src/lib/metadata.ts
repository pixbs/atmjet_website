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
  /** An absolute URL of the video the page opens on, where it opens on one. */
  video?: string | null
  siteName: string
  origin: string
}

const openGraphLocale = (locale: Locale): string =>
  LOCALE_DEFINITIONS.find((definition) => definition.code === locale)?.openGraph ?? locale

/** What a scraper is told a video is, from the only two containers a browser plays inline. */
const VIDEO_TYPES: Record<string, string> = { mp4: 'video/mp4', webm: 'video/webm' }

/**
 * The legacy home page named its own file as `video/mp4`, 1920 by 1080
 * (`docs/legacy-inventory.md` section 2.4). The container is read off the path here rather than
 * assumed, and the size is left unsaid: the file is an editor's, and a size this cannot know is
 * worse than none.
 */
function openGraphVideo(url: string): { url: string; type?: string } {
  const type = VIDEO_TYPES[url.split('.').pop()?.toLowerCase() ?? '']

  return type === undefined ? { url } : { url, type }
}

export function pageMetadata({
  locale,
  locales,
  slug,
  title,
  description,
  image,
  video,
  siteName,
  origin,
}: PageMetadata): Metadata {
  const canonical = localeUrl(origin, locale, slug)
  const shared = { title, description: description ?? undefined }
  const images = image ? [image] : undefined
  const videos = video ? [openGraphVideo(video)] : undefined

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
      videos,
    },
    twitter: { ...shared, card: image ? 'summary_large_image' : 'summary', images },
  }
}
