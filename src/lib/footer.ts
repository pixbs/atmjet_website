import type { SocialNetwork } from '@/lib/links'
import { mediaSource, type ImageSource } from '@/lib/media'
import { navLinks, type NavLink } from '@/lib/nav'
import type { Footer } from '@/payload-types'

/**
 * What the footer draws from the Footer global (issue #89), kept apart from the read in
 * `src/lib/data/footer.ts` so the rule can be tested without a database.
 */
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

/** The Footer global as `findGlobal` returns it, including before anyone has saved it. */
type StoredFooter = Pick<Footer, 'primaryNav' | 'secondaryNav' | 'socials' | 'background'> & {
  cta?: Partial<Footer['cta']> | null
  legal?: Partial<Footer['legal']> | null
}

/**
 * A global nobody has saved, which is every database the seed has not run on, comes back with
 * its groups present and their required words missing, so a line or a button is drawn only once
 * there are words for it.
 */
export function footerNavFrom(footer: StoredFooter, slugs: ReadonlyMap<number, string>): FooterNav {
  const location = footer.legal?.location ?? ''
  const copyright = footer.legal?.copyright ?? ''
  const label = footer.cta?.label ?? ''
  const source = footer.cta?.source ?? ''

  return {
    primary: navLinks(footer.primaryNav, slugs),
    secondary: navLinks(footer.secondaryNav, slugs),
    socials: footer.socials ?? [],
    cta: label === '' || source === '' ? null : { label, source },
    legal: location === '' && copyright === '' ? null : { location, copyright },
    background: mediaSource(typeof footer.background === 'object' ? footer.background : null),
  }
}
