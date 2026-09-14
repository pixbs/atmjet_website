import { describe, expect, it } from 'vitest'

import { countries, countryName, defaultCountry } from '@/lib/countries'

/**
 * The countries the phone field offers (issue #160, `docs/legacy-inventory.md` sections 1.4 and
 * 7.2). The legacy list was fetched from a public API, hand-edited and committed, so these are
 * the rules that replace it: every entry comes from the library that also validates the number.
 */
describe('countries', () => {
  it('gives every country an ISO code and a dial code', () => {
    const list = countries('en')

    expect(list.length).toBeGreaterThan(200)
    for (const country of list) {
      expect(country.iso).toMatch(/^[A-Z]{2}$/)
      expect(country.dialCode).toMatch(/^\+\d{1,4}$/)
      expect(country.name).not.toBe('')
    }
  })

  it('lists them by name in the language being read', () => {
    // The legacy sorted by the English name whatever the page language, so a Russian visitor
    // read a list ordered by words they were not being shown.
    for (const locale of ['en', 'ru'] as const) {
      const names = countries(locale).map((country) => country.name)

      expect(names).toEqual([...names].sort((one, other) => one.localeCompare(other, locale)))
    }
  })

  it('carries the dial codes the legacy list carried', () => {
    const list = countries('en')
    const dialCodeOf = (iso: string) => list.find((country) => country.iso === iso)?.dialCode

    expect(dialCodeOf('AE')).toBe('+971')
    expect(dialCodeOf('RU')).toBe('+7')
    expect(dialCodeOf('UA')).toBe('+380')
  })
})

describe('countryName', () => {
  it('reads in the language being read', () => {
    expect(countryName('AE', 'en')).toBe('United Arab Emirates')
    expect(countryName('RU', 'ru')).toBe('Россия')
  })
})

describe('defaultCountry', () => {
  it('opens where the request says the visitor is', () => {
    expect(defaultCountry('CH', 'en')).toBe('CH')
    // A header arrives in whatever case the edge sent it.
    expect(defaultCountry('ch', 'en')).toBe('CH')
  })

  it('falls back to the home country of the language, for every locale', () => {
    expect(defaultCountry(null, 'en')).toBe('AE')
    expect(defaultCountry(undefined, 'ru')).toBe('RU')
    expect(defaultCountry('', 'uk')).toBe('UA')
  })

  it('ignores a country nobody can be in, rather than opening on it', () => {
    // `XX` is what an edge sends when it cannot place the visitor at all.
    expect(defaultCountry('XX', 'ru')).toBe('RU')
    expect(defaultCountry('  ', 'en')).toBe('AE')
  })

  it('never opens on the island the legacy opened on', () => {
    // `COUNTRIES[1]` was Åland Islands, `+35818`: a dial code the legacy matcher could not
    // recognise, so the field could not correct itself either (section 13).
    expect(defaultCountry(null, 'en')).not.toBe('AX')
  })
})
