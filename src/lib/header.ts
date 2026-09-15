import { navLinks, type NavLink } from '@/lib/nav'
import type { Header } from '@/payload-types'

/**
 * What the header draws from the Header global (issue #88), kept apart from the read in
 * `src/lib/data/header.ts` so the rule can be tested without a database, as the footer's is.
 */
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

/** The Header global as `findGlobal` returns it, including before anyone has saved it. */
type StoredHeader = Pick<Header, 'primaryNav' | 'secondaryNav'> & {
  cta?: Partial<Header['cta']> | null
}

/**
 * A global nobody has saved comes back with its group present and the required words missing,
 * which is what broke the footer on the production database (issue #89); the button is drawn
 * only once there are words on it, rather than as an empty one that opens a dialog naming
 * nothing.
 */
export function headerNavFrom(header: StoredHeader, slugs: ReadonlyMap<number, string>): HeaderNav {
  const label = header.cta?.label ?? ''
  const source = header.cta?.source ?? ''

  return {
    primary: navLinks(header.primaryNav, slugs),
    secondary: navLinks(header.secondaryNav, slugs),
    cta: label === '' || source === '' ? null : { label, source },
  }
}
