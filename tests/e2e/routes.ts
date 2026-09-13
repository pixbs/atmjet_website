/**
 * Route helpers for the browser tiers (issue #39). The legacy site prefixes every path with the
 * locale and so does the rewrite (issue #52, ADR-0003), so every path here carries one.
 * ENABLED_LOCALES mirrors what SiteSettings enables in a fresh environment (issue #53); `uk` is
 * entered in the admin but not served until someone enables it.
 */
export const LOCALES = ['en', 'ru', 'uk'] as const
export type Locale = (typeof LOCALES)[number]

/** Locales a seeded environment serves; a disabled locale (ADR-0003) is not part of the matrix. */
export const ENABLED_LOCALES: readonly Locale[] = ['en', 'ru']

/** Whether paths carry the locale prefix (`/en/aircraft`). */
const LOCALE_ROUTING = true

export function pathFor(route: string, locale: Locale, localeRouting = LOCALE_ROUTING): string {
  const path = route.startsWith('/') ? route : `/${route}`
  if (!localeRouting) return path
  return path === '/' ? `/${locale}` : `/${locale}${path}`
}
