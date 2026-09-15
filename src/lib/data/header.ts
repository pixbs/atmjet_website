import { cache } from 'react'

import type { Locale } from '@/i18n/locales'
import { headerNavFrom, type HeaderNav } from '@/lib/header'
import { navPageIds } from '@/lib/nav'

import { slugsByPageId } from './pages'
import { getPayloadClient } from './payload'

const EMPTY: HeaderNav = { primary: [], secondary: [], cta: null }

/**
 * The navigation the header overlay opens, in one locale (issue #88). The pages it points at are
 * read by `slugsByPageId`, which the footer uses as well.
 *
 * Read through `cache()`, so the header and anything else on the page share one pair of queries
 * per render pass, as the site settings do.
 */
export const getHeaderNav = cache(async (locale: Locale): Promise<HeaderNav> => {
  try {
    const payload = await getPayloadClient()
    const header = await payload.findGlobal({ slug: 'header', locale, depth: 0 })
    const slugs = await slugsByPageId([
      ...navPageIds(header.primaryNav),
      ...navPageIds(header.secondaryNav),
    ])

    return headerNavFrom(header, slugs)
  } catch (error) {
    // The chrome is not worth taking the page down for: the logo still leads home.
    console.warn('[header] the database was unreachable, so the menu has no links.', error)
    return EMPTY
  }
})
