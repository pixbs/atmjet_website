/**
 * The single locale list shared by routing, Payload and the tests (ADR-0003).
 *
 * `ALL_LOCALES` is the set editors can enter content for and is what `localization.locales` in
 * `src/payload.config.ts` is built from. `ROUTED_LOCALES` is the subset that is public today and
 * therefore reachable through a URL; `uk` is entered in the admin but stays unrouted until its
 * catalogue is complete. Issue #53 replaces that constant with a `SiteSettings.enabledLocales`
 * read, which is why every consumer goes through this module instead of hard-coding a list.
 *
 * This module must stay free of framework imports: `payload.config.ts`, the next-intl routing
 * and the Vitest suites all load it, and only the last of those runs outside Next.
 */
export const ALL_LOCALES = ['en', 'ru', 'uk'] as const

export type Locale = (typeof ALL_LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'

/** Public locales, in the order the legacy site served them. */
export const ROUTED_LOCALES: readonly Locale[] = ['en', 'ru']

export interface LocaleDefinition {
  code: Locale
  /** Shown in the admin locale selector and in the public locale switcher (E6.3). */
  label: string
  direction: 'ltr' | 'rtl'
}

/**
 * One entry per locale, in `ALL_LOCALES` order. Labels are written in the locale itself, which
 * is what the legacy switcher did and what editors expect in the admin selector.
 */
export const LOCALE_DEFINITIONS: readonly LocaleDefinition[] = [
  { code: 'en', label: 'English', direction: 'ltr' },
  { code: 'ru', label: 'Русский', direction: 'ltr' },
  { code: 'uk', label: 'Українська', direction: 'ltr' },
]

export function isRoutedLocale(value: string): value is Locale {
  return (ROUTED_LOCALES as readonly string[]).includes(value)
}

export function localeDefinition(code: Locale): LocaleDefinition {
  const definition = LOCALE_DEFINITIONS.find((entry) => entry.code === code)
  if (!definition) {
    throw new Error(`No locale definition for "${code}"; add it to LOCALE_DEFINITIONS.`)
  }
  return definition
}
