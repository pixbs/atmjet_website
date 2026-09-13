import { describe, expect, it } from 'vitest'

import { ALL_LOCALES, DEFAULT_LOCALE, DEFAULT_LOCALES, LOCALE_DEFINITIONS } from '@/i18n/locales'
import { routing } from '@/i18n/routing'

/**
 * The routing contract of issue #52: the locale list the rest of the app shares and the
 * next-intl configuration built from it. Behaviour in the browser, the proxy included, is
 * covered by tests/e2e/i18n.e2e.spec.ts.
 */
describe('locale list', () => {
  it('keeps every default locale inside the Payload set', () => {
    expect(DEFAULT_LOCALES.every((locale) => ALL_LOCALES.includes(locale))).toBe(true)
  })

  it('serves the default locale out of the box', () => {
    expect(DEFAULT_LOCALES).toContain(DEFAULT_LOCALE)
  })

  it('defines every locale once, in the same order', () => {
    expect(LOCALE_DEFINITIONS.map(({ code }) => code)).toEqual([...ALL_LOCALES])
  })
})

describe('next-intl routing', () => {
  it('recognises every locale an editor can enable, not only the default ones', () => {
    // Which of them the site serves is decided per request by the proxy (issue #53); a locale
    // missing here could not be routed at all without a deploy.
    expect(routing.locales).toBe(ALL_LOCALES)
    expect(routing.defaultLocale).toBe(DEFAULT_LOCALE)
  })

  it('keeps the locale prefix on every URL, as the legacy site did', () => {
    expect(routing.localePrefix).toBe('always')
  })
})
