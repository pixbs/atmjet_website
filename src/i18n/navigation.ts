import { createNavigation } from 'next-intl/navigation'

import { routing } from './routing'

/**
 * Locale-aware navigation helpers. Components import these instead of `next/link` and
 * `next/navigation` so no component builds a locale prefix by hand (ADR-0003).
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)
