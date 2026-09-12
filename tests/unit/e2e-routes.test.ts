import { describe, expect, it } from 'vitest'
import { ENABLED_LOCALES, LOCALES, pathFor } from '../e2e/routes'

describe('e2e routes', () => {
  it('lists only public locales in the matrix', () => {
    expect(ENABLED_LOCALES.every((locale) => LOCALES.includes(locale))).toBe(true)
    expect(ENABLED_LOCALES).toContain('en')
  })

  it('builds paths without a prefix while locale routing is off', () => {
    expect(pathFor('/', 'ru', false)).toBe('/')
    expect(pathFor('aircraft', 'en', false)).toBe('/aircraft')
  })

  it('prefixes paths with the locale once routing is on', () => {
    expect(pathFor('/', 'ru', true)).toBe('/ru')
    expect(pathFor('/aircraft', 'en', true)).toBe('/en/aircraft')
    expect(pathFor('yachts/blue-star', 'uk', true)).toBe('/uk/yachts/blue-star')
  })
})
