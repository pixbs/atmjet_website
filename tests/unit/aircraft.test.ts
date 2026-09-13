import { describe, expect, it } from 'vitest'

import {
  canonicalRegistration,
  detailLayoutFor,
  formatLegacyInteger,
  formatLegacyReal,
} from '@/lib/aircraft'

/**
 * Aircraft value handling (issue #63). The registration rule decides which legacy rows E5.7
 * merges, and the number formatters decide whether a ported detail page shows the same text the
 * legacy one did, so both are parity concerns rather than style.
 */
describe('canonicalRegistration', () => {
  it('matches the rule the legacy comparison used', () => {
    // docs/legacy-inventory.md section 8: upper(replace(x, '-', '')).
    expect(canonicalRegistration('RA-73025')).toBe('RA73025')
    expect(canonicalRegistration('ra-73025')).toBe('RA73025')
    expect(canonicalRegistration('RA 73025')).toBe('RA73025')
    expect(canonicalRegistration('RA73025')).toBe('RA73025')
  })

  it('gives one key to every spelling of the same aircraft', () => {
    const spellings = ['M-ABCD', 'm-abcd', ' M ABCD ', 'MABCD']
    const keys = new Set(spellings.map((entry) => canonicalRegistration(entry)))

    expect(keys.size).toBe(1)
  })

  it('leaves characters other than separators alone', () => {
    // Deleting anything else would merge two aircraft that are not the same.
    expect(canonicalRegistration('N1.23A')).toBe('N1.23A')
    expect(canonicalRegistration('OE/LAB')).toBe('OE/LAB')
  })

  it('treats a blank or absent registration as missing', () => {
    expect(canonicalRegistration('')).toBeUndefined()
    expect(canonicalRegistration('  -  ')).toBeUndefined()
    expect(canonicalRegistration(null)).toBeUndefined()
    expect(canonicalRegistration(7)).toBeUndefined()
  })
})

describe('formatLegacyReal', () => {
  it('reproduces what Postgres prints for a real column', () => {
    // Verified against `select 1.8::real::text` and friends on Postgres 16.
    expect(formatLegacyReal(1.8)).toBe('1.8')
    expect(formatLegacyReal(0.1)).toBe('0.1')
    expect(formatLegacyReal(123.456)).toBe('123.456')
    expect(formatLegacyReal(0.000123)).toBe('0.000123')
    expect(formatLegacyReal(2.4)).toBe('2.4')
    expect(formatLegacyReal(15.5)).toBe('15.5')
  })

  it('drops a trailing zero, as the cast does', () => {
    expect(formatLegacyReal(1.0)).toBe('1')
    expect(formatLegacyReal(2.0)).toBe('2')
  })

  it('does not leak the 64-bit widening of a 32-bit value', () => {
    // Reading a real into JavaScript gives 1.7999999523162842; the page showed 1.8.
    expect(formatLegacyReal(Math.fround(1.8))).toBe('1.8')
    expect(formatLegacyReal(Math.fround(6.1))).toBe('6.1')
    expect(formatLegacyReal(Math.fround(2.03))).toBe('2.03')
  })

  it('reads a value that arrives as text', () => {
    expect(formatLegacyReal('7.62')).toBe('7.62')
  })

  it('treats unparseable input as missing', () => {
    expect(formatLegacyReal('')).toBeUndefined()
    expect(formatLegacyReal('tall')).toBeUndefined()
    expect(formatLegacyReal(null)).toBeUndefined()
    expect(formatLegacyReal(Number.POSITIVE_INFINITY)).toBeUndefined()
  })

  it('uses nine digits for a value that needs them to round-trip', () => {
    // Most float32 values need eight or fewer significant digits; a few need nine. Such values
    // lie outside the range a cabin dimension or a cruise speed occupies, which is also where
    // Postgres switches to exponent notation, so this pins the arithmetic rather than parity.
    const needsNine = 127362064384

    expect(Math.fround(Number.parseFloat(formatLegacyReal(needsNine)!))).toBe(
      Math.fround(needsNine),
    )
  })

  it('diverges from Postgres only above the exponent threshold', () => {
    // Postgres prints 1e+10; no cabin dimension or cruise speed comes near it, so the plain
    // form is kept rather than reimplementing the exponent rule for values that cannot occur.
    expect(formatLegacyReal(1e10)).toBe('10000000000')
  })
})

describe('formatLegacyInteger', () => {
  it('prints a whole number with no separator or decimal point', () => {
    expect(formatLegacyInteger(6500)).toBe('6500')
    expect(formatLegacyInteger(0)).toBe('0')
    expect(formatLegacyInteger(-120)).toBe('-120')
  })

  it('reads a value that arrives as text', () => {
    expect(formatLegacyInteger('6500')).toBe('6500')
  })

  it('treats unparseable input as missing', () => {
    expect(formatLegacyInteger('')).toBeUndefined()
    expect(formatLegacyInteger('far')).toBeUndefined()
    expect(formatLegacyInteger(null)).toBeUndefined()
  })
})

describe('detailLayoutFor', () => {
  it('needs more than one image for the rich layout, as the legacy fallback did', () => {
    expect(detailLayoutFor(0)).toBe('basic')
    expect(detailLayoutFor(1)).toBe('basic')
    expect(detailLayoutFor(2)).toBe('rich')
    expect(detailLayoutFor(9)).toBe('rich')
  })
})
