import { describe, expect, it } from 'vitest'

import {
  countryForNumber,
  formatPhone,
  guardsThePlus,
  isValidPhone,
  matchesSearch,
  numberForCountry,
} from '@/lib/phone'

/**
 * What the phone field does to what is typed into it (issue #108,
 * `docs/legacy-inventory.md` section 7.2).
 */
describe('formatPhone', () => {
  it('groups the number the way its own country groups it', () => {
    expect(formatPhone('+971504589926')).toBe('+971 50 458 9926')
    expect(formatPhone('79161234567')).toBe('+7 916 123 45 67')
  })

  it('puts the plus back on whatever was typed, as the legacy did on every keystroke', () => {
    expect(formatPhone('971504589926')).toBe('+971 50 458 9926')
  })

  it('leaves a bare plus for an empty field, which is what focusing it writes', () => {
    expect(formatPhone('')).toBe('+')
    expect(formatPhone('+')).toBe('+')
  })
})

describe('countryForNumber', () => {
  it('reads the country from the dial code', () => {
    expect(countryForNumber('+971 50 458 9926')).toBe('AE')
    expect(countryForNumber('+380 44 123 4567')).toBe('UA')
  })

  it('prefers the longest code that fits, not the first three digits', () => {
    // The legacy read `/^\+(\d{1,3})/`, so every `+1` number was the United States and a code
    // longer than three digits could never match at all (section 13).
    expect(countryForNumber('+1268 464 1234')).toBe('AG')
    expect(countryForNumber('+35818 12345')).toBe('AX')
  })

  it('says nothing about a field holding nothing', () => {
    expect(countryForNumber('+')).toBeUndefined()
    expect(countryForNumber('')).toBeUndefined()
  })
})

describe('numberForCountry', () => {
  it('starts the field at the country that was chosen', () => {
    expect(numberForCountry('+', '+971')).toBe('+971 ')
    expect(numberForCountry('+7916', '+971')).toBe('+971 ')
  })

  it('keeps what is already typed when it is already that country', () => {
    expect(numberForCountry('+971504589926', '+971')).toBe('+971 50 458 9926')
  })
})

describe('matchesSearch', () => {
  const aland = { name: 'Åland Islands', dialCode: '+35818' }

  it('ignores the accents and the spaces nobody types', () => {
    expect(matchesSearch(aland, 'aland')).toBe(true)
    expect(matchesSearch(aland, 'ÅLAND IS')).toBe(true)
  })

  it('answers to a dial code as readily as to a name', () => {
    expect(matchesSearch({ name: 'United Arab Emirates', dialCode: '+971' }, '971')).toBe(true)
    expect(matchesSearch({ name: 'United Arab Emirates', dialCode: '+971' }, '+9')).toBe(true)
  })

  it('offers everything while the box is empty, and nothing that does not match', () => {
    expect(matchesSearch(aland, '')).toBe(true)
    expect(matchesSearch(aland, 'france')).toBe(false)
  })
})

describe('isValidPhone', () => {
  it('takes a number a country would answer', () => {
    expect(isValidPhone('+971 50 458 9926')).toBe(true)
  })

  it('turns down one that is too short to be one, and an empty field', () => {
    expect(isValidPhone('+971 50')).toBe(false)
    expect(isValidPhone('+')).toBe(false)
    expect(isValidPhone('')).toBe(false)
  })
})

describe('guardsThePlus', () => {
  it('stops the keystroke that would eat the plus', () => {
    expect(guardsThePlus('+971', 1)).toBe(true)
  })

  it('leaves every other keystroke alone', () => {
    expect(guardsThePlus('+971', 4)).toBe(false)
    expect(guardsThePlus('971', 1)).toBe(false)
    expect(guardsThePlus('+971', null)).toBe(false)
  })
})
