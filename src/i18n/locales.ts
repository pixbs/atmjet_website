/**
 * The single locale list shared by routing, Payload and the tests (ADR-0003).
 *
 * `ALL_LOCALES` is the set editors can enter content for and is what `localization.locales` in
 * `src/payload.config.ts` is built from. Which of them the public site serves is
 * `SiteSettings.enabledLocales` (issue #53), read through `src/lib/data/site-settings.ts`;
 * `DEFAULT_LOCALES` is what a new settings document starts with and what a build or a request
 * that cannot reach the database falls back to.
 *
 * This module must stay free of framework imports: `payload.config.ts`, the next-intl routing
 * and the Vitest suites all load it, and only the last of those runs outside Next.
 */
export const ALL_LOCALES = ['en', 'ru', 'uk'] as const

export type Locale = (typeof ALL_LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'

/** What the site serves until an editor says otherwise: the locales the legacy site served. */
export const DEFAULT_LOCALES: readonly Locale[] = ['en', 'ru']

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
