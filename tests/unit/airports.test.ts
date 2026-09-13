import { describe, expect, it } from 'vitest'

import {
  normaliseCode,
  normaliseText,
  parseCoordinate,
  parsePassengersPerYear,
} from '@/lib/airports'

/**
 * Airport normalisation (issue #64). The legacy data arrives from two tables with different
 * column types and no cleaning, so these are the rules that make one row out of either.
 */
describe('normaliseCode', () => {
  it('upper-cases and strips whitespace', () => {
    expect(normaliseCode(' uudd ')).toBe('UUDD')
    expect(normaliseCode('u u d d')).toBe('UUDD')
    expect(normaliseCode('Svo')).toBe('SVO')
  })

  it('treats an empty or absent code as missing, not as an empty string', () => {
    expect(normaliseCode('')).toBeUndefined()
    expect(normaliseCode('   ')).toBeUndefined()
    expect(normaliseCode(null)).toBeUndefined()
    expect(normaliseCode(undefined)).toBeUndefined()
    expect(normaliseCode(42)).toBeUndefined()
  })
})

describe('normaliseText', () => {
  it('collapses whitespace without touching the words', () => {
    expect(normaliseText('  Sheremetyevo   International  ')).toBe('Sheremetyevo International')
    expect(normaliseText('Москва\tВнуково')).toBe('Москва Внуково')
  })

  it('keeps case, because a name is not a code', () => {
    expect(normaliseText('John F. Kennedy')).toBe('John F. Kennedy')
  })

  it('treats blank as missing', () => {
    expect(normaliseText('   ')).toBeUndefined()
    expect(normaliseText(null)).toBeUndefined()
  })
})

describe('parsePassengersPerYear', () => {
  it('reads the separators the legacy text column contains', () => {
    expect(parsePassengersPerYear('1 234 567')).toBe(1234567)
    expect(parsePassengersPerYear('1,234,567')).toBe(1234567)
    expect(parsePassengersPerYear('49837000')).toBe(49837000)
  })

  it('ranks by traffic rather than lexicographically, which the legacy could not', () => {
    // The legacy column is text, so it sorted "9" above "1000000" (inventory section 8.5).
    const nine = parsePassengersPerYear('9') ?? 0
    const million = parsePassengersPerYear('1000000') ?? 0

    expect(million).toBeGreaterThan(nine)
  })

  it('leaves an unknown count undefined rather than zero', () => {
    // Zero would rank an airport of unknown size as the quietest one there is.
    expect(parsePassengersPerYear('')).toBeUndefined()
    expect(parsePassengersPerYear('unknown')).toBeUndefined()
    expect(parsePassengersPerYear(null)).toBeUndefined()
  })

  it('refuses a count too large to be an exact integer', () => {
    // Legacy text is unvalidated, so a stray run of digits must not become a rounded number.
    expect(parsePassengersPerYear('9'.repeat(20))).toBeUndefined()
  })

  it('accepts a number that has already been parsed', () => {
    expect(parsePassengersPerYear(500)).toBe(500)
    expect(parsePassengersPerYear(500.7)).toBe(500)
    expect(parsePassengersPerYear(Number.NaN)).toBeUndefined()
  })
})

describe('parseCoordinate', () => {
  it('reads the text the legacy airports table stored', () => {
    expect(parseCoordinate('55.972642', 90)).toBeCloseTo(55.972642)
    expect(parseCoordinate(' -37.4146 ', 180)).toBeCloseTo(-37.4146)
    expect(parseCoordinate(12.5, 90)).toBe(12.5)
  })

  it('rejects a coordinate outside the real range instead of storing it', () => {
    // A bad coordinate silently places an airport in the sea.
    expect(parseCoordinate('91', 90)).toBeUndefined()
    expect(parseCoordinate('-181', 180)).toBeUndefined()
  })

  it('treats unparseable input as missing', () => {
    expect(parseCoordinate('', 90)).toBeUndefined()
    expect(parseCoordinate('north', 90)).toBeUndefined()
    expect(parseCoordinate(null, 90)).toBeUndefined()
  })
})
