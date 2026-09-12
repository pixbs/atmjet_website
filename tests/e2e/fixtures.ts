/**
 * Playwright fixtures for the browser tiers (issue #39): the locale under test, page objects and
 * a locale matrix helper. Specs import `test` and `expect` from here instead of @playwright/test.
 */
import { test as base, expect } from '@playwright/test'
import { AdminPage } from './pages/admin'
import { HomePage } from './pages/home'
import { ENABLED_LOCALES, type Locale } from './routes'

interface Fixtures {
  /** the site locale under test (Playwright's own `locale` option is the browser locale) */
  siteLocale: Locale
  home: HomePage
  admin: AdminPage
}

export const test = base.extend<Fixtures>({
  siteLocale: ['en', { option: true }],
  home: async ({ page, siteLocale }, provide) => {
    await provide(new HomePage(page, siteLocale))
  },
  admin: async ({ page }, provide) => {
    await provide(new AdminPage(page))
  },
})

export { expect }

/** Runs the same specs once per enabled locale, each in its own describe block with the locale option set. */
export function forEachLocale(
  define: (locale: Locale) => void,
  locales: readonly Locale[] = ENABLED_LOCALES,
): void {
  for (const locale of locales) {
    test.describe(`[${locale}]`, () => {
      test.use({ siteLocale: locale })
      define(locale)
    })
  }
}
