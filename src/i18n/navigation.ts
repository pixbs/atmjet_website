import { createNavigation } from 'next-intl/navigation'

import { routing } from './routing'

/**
 * Locale-aware navigation (ADR-0003). `Link` writes `/en/...` for a path given as `/...`, so no
 * component has to know that every URL carries its locale, and none of them can forget it —
 * which is how the legacy navbar ended up linking home without a prefix
 * (`docs/legacy-inventory.md` section 3.3).
 *
 * `usePathname` returns the path without the locale prefix, which is what a link that switches
 * language needs (issue #90), and what `useRouter` expects back when a control navigates to a
 * listing's own URL (issue #135). `redirect` is exported when the first component needs it.
 */
export const { Link, usePathname, useRouter } = createNavigation(routing)
