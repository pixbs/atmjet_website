import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { ALL_LOCALES, DEFAULT_LOCALE, isRoutedLocale, ROUTED_LOCALES } from '@/i18n/locales'
import { isProxiedPath, PROXY_MATCHER } from '@/i18n/proxy-matcher'
import { routing } from '@/i18n/routing'

/**
 * The routing contract of issue #52: the locale list the rest of the app shares, the
 * next-intl configuration built from it, and the paths the proxy is allowed to touch.
 * Behaviour in the browser is covered by tests/e2e/i18n.e2e.spec.ts.
 */
describe('locale list', () => {
  it('mirrors the Payload localisation set', () => {
    expect(ALL_LOCALES).toEqual(['en', 'ru', 'uk'])
  })

  it('routes only the locales the legacy site served publicly', () => {
    expect(ROUTED_LOCALES).toEqual(['en', 'ru'])
    expect(ROUTED_LOCALES).not.toContain('uk')
  })

  it('keeps every routed locale inside the Payload set', () => {
    expect(ROUTED_LOCALES.every((locale) => ALL_LOCALES.includes(locale))).toBe(true)
  })

  it('defaults to English, as the legacy middleware did', () => {
    expect(DEFAULT_LOCALE).toBe('en')
    expect(ROUTED_LOCALES).toContain(DEFAULT_LOCALE)
  })

  it('recognises routed locales and rejects everything else', () => {
    expect(isRoutedLocale('en')).toBe(true)
    expect(isRoutedLocale('ru')).toBe(true)
    expect(isRoutedLocale('uk')).toBe(false)
    expect(isRoutedLocale('de')).toBe(false)
    expect(isRoutedLocale('')).toBe(false)
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

describe('proxy matcher', () => {
  const matches = isProxiedPath

  it('matches the literal Next parses out of src/proxy.ts', () => {
    // Next reads `config.matcher` statically, so the proxy cannot import PROXY_MATCHER.
    // This reads the literal back and pins the two together.
    const source = readFileSync(new URL('../../src/proxy.ts', import.meta.url), 'utf8')
    const literal = source.match(/matcher: \[([^\]]*)\]/)?.[1]

    expect(literal, 'src/proxy.ts must export a literal matcher array').toBeDefined()

    // The source escapes every backslash, so `\\.` on disk is the single `\.` at runtime.
    const patterns = [...literal!.matchAll(/'([^']*)'/g)].map(([, pattern]) =>
      pattern.replace(/\\\\/g, '\\'),
    )
    expect(patterns).toEqual([...PROXY_MATCHER])
  })

  it('handles locale routing for page requests', () => {
    expect(matches('/')).toBe(true)
    expect(matches('/en')).toBe(true)
    expect(matches('/ru/aircraft')).toBe(true)
    expect(matches('/aircraft/gulfstream-g650')).toBe(true)
  })

  it('leaves the Payload admin and the API alone', () => {
    expect(matches('/admin')).toBe(false)
    expect(matches('/admin/collections/media')).toBe(false)
    expect(matches('/api/media/file/hero.webp')).toBe(false)
    expect(matches('/api/graphql')).toBe(false)
  })

  it('leaves framework internals and files with an extension alone', () => {
    expect(matches('/_next/static/chunk.js')).toBe(false)
    expect(matches('/_vercel/insights/view')).toBe(false)
    expect(matches('/sitemap.xml')).toBe(false)
    expect(matches('/robots.txt')).toBe(false)
    expect(matches('/video/background_full.mp4')).toBe(false)
  })
})
