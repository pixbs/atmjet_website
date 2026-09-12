/**
 * Route helpers for the browser tiers (issue #39). The legacy site prefixes every path with the
 * locale; the rewrite does the same once the i18n routing lands (issue #52), which flips
 * LOCALE_ROUTING and extends ENABLED_LOCALES with its own tests.
 */
export const LOCALES = ['en', 'ru', 'uk'] as const
export type Locale = (typeof LOCALES)[number]

/** Locales that are public today; hidden locales (ADR-0003) are not part of the browser matrix. */
export const ENABLED_LOCALES: readonly Locale[] = ['en']

/** Whether paths carry the locale prefix (`/en/aircraft`). */
export const LOCALE_ROUTING = false

export function pathFor(route: string, locale: Locale, localeRouting = LOCALE_ROUTING): string {
  const path = route.startsWith('/') ? route : `/${route}`
  if (!localeRouting) return path
  return path === '/' ? `/${locale}` : `/${locale}${path}`
}
