/**
 * The single locale list shared by routing, Payload and the tests (ADR-0003).
 *
 * `ALL_LOCALES` mirrors `localization.locales` in `src/payload.config.ts`: editors can enter
 * content for each of them. `ROUTED_LOCALES` is the subset that is public today and therefore
 * reachable through a URL; `uk` is entered in the admin but stays unrouted until its catalogue
 * is complete. Issue #53 replaces the constant with a `SiteSettings.enabledLocales` read, which
 * is why every consumer goes through this module instead of hard-coding a list.
 */
export const ALL_LOCALES = ['en', 'ru', 'uk'] as const

export type Locale = (typeof ALL_LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'

/** Public locales, in the order the legacy site served them. */
export const ROUTED_LOCALES: readonly Locale[] = ['en', 'ru']

export function isRoutedLocale(value: string): value is Locale {
  return (ROUTED_LOCALES as readonly string[]).includes(value)
}
