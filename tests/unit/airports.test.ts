import { describe, expect, it } from 'vitest'

import { airportOption, normaliseCode, normaliseText } from '@/lib/airports'

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

/**
 * How one airport reads in the search list (issue #107, `docs/legacy-inventory.md` section 8.5).
 */
describe('airportOption', () => {
  const dubai = {
    city: 'Dubai',
    country: 'United Arab Emirates',
    label: 'Dubai International',
    icao: 'OMDB',
  }

  it('names the city, the code, the country and the airport, as the legacy list did', () => {
    expect(airportOption(dubai)).toBe('Dubai (OMDB) United Arab Emirates, Dubai International')
  })

  it('falls back to the IATA code where an airport has no ICAO one', () => {
    expect(airportOption({ ...dubai, icao: null, iata: 'dxb' })).toBe(
      'Dubai (DXB) United Arab Emirates, Dubai International',
    )
  })

  it('leaves out what is missing rather than the gap the legacy left', () => {
    // The legacy template printed `Dubai  United Arab Emirates` with two spaces where the code
    // would have gone, and a bare comma for an airport with no name of its own.
    expect(airportOption({ ...dubai, icao: null, iata: null })).toBe(
      'Dubai United Arab Emirates, Dubai International',
    )
    expect(airportOption({ ...dubai, label: '  ' })).toBe('Dubai (OMDB) United Arab Emirates')
  })

  it('says nothing about an airport that carries nothing to say', () => {
    expect(airportOption({})).toBe('')
  })
})
