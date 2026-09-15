import { cache } from 'react'

import type { Locale } from '@/i18n/locales'
import { footerNavFrom, type FooterNav } from '@/lib/footer'
import { navPageIds } from '@/lib/nav'

import { slugsByPageId } from './pages'
import { getPayloadClient } from './payload'

const EMPTY: FooterNav = {
  primary: [],
  secondary: [],
  socials: [],
  cta: null,
  legal: null,
  background: null,
}

/**
 * The footer an editor keeps in the Footer global, in one locale (issue #89).
 *
 * `depth: 1` for the photograph and no `select` beside it: an upload's `url` is computed from
 * its filename, so narrowing the fields of the populated document returns `url: null` and the
 * picture disappears. The page links are read by id instead, through `slugsByPageId`.
 */
export const getFooterNav = cache(async (locale: Locale): Promise<FooterNav> => {
  try {
    const payload = await getPayloadClient()
    const footer = await payload.findGlobal({ slug: 'footer', locale, depth: 1 })
    const slugs = await slugsByPageId([
      ...navPageIds(footer.primaryNav),
      ...navPageIds(footer.secondaryNav),
    ])

    return footerNavFrom(footer, slugs)
  } catch (error) {
    // The chrome is not worth taking the page down for: the page still ends, without its links.
    console.warn('[footer] the database was unreachable, so the footer has no links.', error)
    return EMPTY
  }
})
