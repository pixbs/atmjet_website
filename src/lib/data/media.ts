import type { Locale } from '@/i18n/locales'
import { mediaSource, type ImageSource } from '@/lib/media'

import { getPayloadClient } from './payload'

/**
 * Uploads a page can draw, oldest first (issue #101).
 *
 * The alt text is localized, so the locale is part of the question. A document that names no
 * file is left out rather than rendered as a broken image, and a database this cannot reach
 * returns nothing rather than taking the page down — an image is worth less than the page
 * around it.
 */
export async function listMediaImages(locale: Locale, limit: number): Promise<ImageSource[]> {
  try {
    const payload = await getPayloadClient()
    const media = await payload.find({
      collection: 'media',
      locale,
      limit,
      depth: 0,
      sort: 'id',
      // Only what a visitor may see, which for uploads is all of them (docs/access-matrix.md).
      overrideAccess: false,
    })

    return media.docs.flatMap((doc) => {
      const source = mediaSource(doc)
      return source === null ? [] : [source]
    })
  } catch (error) {
    console.warn('[media] the database was unreachable, so no images are shown.', error)
    return []
  }
}
