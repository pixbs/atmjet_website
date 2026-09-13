import { describe, expect, it } from 'vitest'

import { ALL_LOCALES, DEFAULT_LOCALE, LOCALE_DEFINITIONS, ROUTED_LOCALES } from '@/i18n/locales'
import { routing } from '@/i18n/routing'

/**
 * The routing contract of issue #52: the locale list the rest of the app shares and the
 * next-intl configuration built from it. Behaviour in the browser, the proxy included, is
 * covered by tests/e2e/i18n.e2e.spec.ts.
 */
describe('locale list', () => {
  it('keeps every routed locale inside the Payload set', () => {
    expect(ROUTED_LOCALES.every((locale) => ALL_LOCALES.includes(locale))).toBe(true)
  })

  it('defaults to a routed locale', () => {
    expect(ROUTED_LOCALES).toContain(DEFAULT_LOCALE)
  })

  it('defines every locale once, in the same order', () => {
    expect(LOCALE_DEFINITIONS.map(({ code }) => code)).toEqual([...ALL_LOCALES])
  })
})

describe('next-intl routing', () => {
  it('is built from the shared locale list', () => {
    expect(routing.locales).toBe(ROUTED_LOCALES)
    expect(routing.defaultLocale).toBe(DEFAULT_LOCALE)
  })

  it('keeps the locale prefix on every URL, as the legacy site did', () => {
    expect(routing.localePrefix).toBe('always')
  })
})
