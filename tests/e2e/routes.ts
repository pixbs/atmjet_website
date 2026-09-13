/**
 * Route helpers for the browser tiers (issue #39). The legacy site prefixes every path with the
 * locale and so does the rewrite (issue #52, ADR-0003), so every path here carries one.
 * ENABLED_LOCALES mirrors ROUTED_LOCALES in src/i18n/locales.ts; `uk` joins it in issue #53,
 * when SiteSettings decides which locales are public.
 */
export const LOCALES = ['en', 'ru', 'uk'] as const
export type Locale = (typeof LOCALES)[number]

/** Locales that are public today; hidden locales (ADR-0003) are not part of the browser matrix. */
export const ENABLED_LOCALES: readonly Locale[] = ['en', 'ru']

/** Whether paths carry the locale prefix (`/en/aircraft`). */
export const LOCALE_ROUTING = true

export function pathFor(route: string, locale: Locale, localeRouting = LOCALE_ROUTING): string {
  const path = route.startsWith('/') ? route : `/${route}`
  if (!localeRouting) return path
  return path === '/' ? `/${locale}` : `/${locale}${path}`
}
