import { cache } from 'react'

import type { Locale } from '@/i18n/locales'
import { navLinks, navPageIds, type NavLink } from '@/lib/nav'

import { getPayloadClient } from './payload'

export interface HeaderNav {
  /** The services column of the open menu. */
  primary: NavLink[]
  /** The company column. */
  secondary: NavLink[]
  /**
   * The booking button. `source` is the value the legacy `?showBooking=` query carried and is
   * passed on to Telegram as the lead's origin (`docs/legacy-inventory.md` section 3.9).
   */
  cta: { label: string; source: string } | null
}

const EMPTY: HeaderNav = { primary: [], secondary: [], cta: null }

/**
 * The navigation the header overlay opens, in one locale (issue #88).
 *
 * Two queries rather than one `depth: 1` read: the relationship resolves to whole Page
 * documents, and the chrome renders on every page of the site, so it asks for the twelve slugs
 * it needs instead of for twelve pages with everything on them.
 *
 * Read through `cache()`, so the header and anything else on the page share one pair of queries
 * per render pass, as the site settings do.
 */
export const getHeaderNav = cache(async (locale: Locale): Promise<HeaderNav> => {
  try {
    const payload = await getPayloadClient()
    const header = await payload.findGlobal({ slug: 'header', locale, depth: 0 })
    const ids = [...navPageIds(header.primaryNav), ...navPageIds(header.secondaryNav)]

    const docs =
      ids.length === 0
        ? []
        : (
            await payload.find({
              collection: 'pages',
              where: { id: { in: ids } },
              limit: 0,
              depth: 0,
              select: { slug: true },
              // Only what a visitor can read: a link to a draft page is a link to a 404.
              overrideAccess: false,
            })
          ).docs

    const slugs = new Map(
      docs.flatMap((page) =>
        typeof page.slug === 'string' ? [[page.id, page.slug] as const] : [],
      ),
    )

    return {
      primary: navLinks(header.primaryNav, slugs),
      secondary: navLinks(header.secondaryNav, slugs),
      cta: header.cta ? { label: header.cta.label, source: header.cta.source } : null,
    }
  } catch (error) {
    // The chrome is not worth taking the page down for: the logo still leads home.
    console.warn('[header] the database was unreachable, so the menu has no links.', error)
    return EMPTY
  }
})
