import { cache } from 'react'

import type { Locale } from '@/i18n/locales'
import type { SocialNetwork } from '@/lib/links'
import { mediaSource, type ImageSource } from '@/lib/media'
import { navLinks, navPageIds, type NavLink } from '@/lib/nav'

import { slugsByPageId } from './pages'
import { getPayloadClient } from './payload'

export interface FooterNav {
  /** The first row of page links. */
  primary: NavLink[]
  /** The second row. */
  secondary: NavLink[]
  /** Which accounts to link, in the order an editor put them; the handles live in SiteSettings. */
  socials: SocialNetwork[]
  /** The booking button, with the `?showBooking=` value the legacy link carried (section 3.9). */
  cta: { label: string; source: string } | null
  /** The two lines above the fold of the page, `{year}` still in them. */
  legal: { location: string; copyright: string } | null
  /** The photograph behind the footer. */
  background: ImageSource | null
}

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

    return {
      primary: navLinks(footer.primaryNav, slugs),
      secondary: navLinks(footer.secondaryNav, slugs),
      socials: footer.socials ?? [],
      cta: footer.cta ? { label: footer.cta.label, source: footer.cta.source } : null,
      legal: footer.legal
        ? { location: footer.legal.location, copyright: footer.legal.copyright }
        : null,
      background: mediaSource(typeof footer.background === 'object' ? footer.background : null),
    }
  } catch (error) {
    // The chrome is not worth taking the page down for: the page still ends, without its links.
    console.warn('[footer] the database was unreachable, so the footer has no links.', error)
    return EMPTY
  }
})
