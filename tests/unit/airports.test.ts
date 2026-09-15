import { describe, expect, it } from 'vitest'

import { airportOption, normaliseCode, normaliseText, rankAirports } from '@/lib/airports'

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

/**
 * What the search does with what it finds (issue #159, `docs/legacy-inventory.md` section 8.5).
 * The legacy query ordered by a text column ascending, so the smallest airports came first and
 * `9` sorted above `1000000` (section 13, entry 69).
 */
describe('rankAirports', () => {
  const dubai = { city: 'Dubai', icao: 'OMDB', passengersPerYear: 86_900_000 }
  const maktoum = { city: 'Dubai', icao: 'OMDW', passengersPerYear: 1_300_000 }
  const luton = { city: 'London', icao: 'EGGW' }

  it('offers the busiest airport first', () => {
    expect(rankAirports([maktoum, dubai], 10).map((one) => one.icao)).toEqual(['OMDB', 'OMDW'])
  })

  it('lists an airport nobody counted behind the ones that were counted', () => {
    expect(rankAirports([luton, maktoum], 10).map((one) => one.icao)).toEqual(['OMDW', 'EGGW'])
  })

  it('keeps the order it was given among airports it cannot tell apart', () => {
    const geneva = { city: 'Geneva', icao: 'LSGG' }

    expect(rankAirports([luton, geneva], 10).map((one) => one.icao)).toEqual(['EGGW', 'LSGG'])
  })

  it('offers no more than the list has room for', () => {
    expect(rankAirports([dubai, maktoum, luton], 2)).toHaveLength(2)
    expect(rankAirports([dubai], 0)).toEqual([])
  })
})

describe('the de-duplication a ranked list goes through', () => {
  it('keeps one row per airport, as the legacy search did over its two tables', () => {
    const rows = [
      { city: 'Dubai', icao: 'OMDB', label: 'Dubai International' },
      { city: 'Dubai', icao: 'OMDB', label: 'Dubai Intl' },
      { city: 'Dubai', icao: 'OMDW', label: 'Al Maktoum' },
    ]

    expect(rankAirports(rows, 10).map((one) => one.label)).toEqual([
      'Dubai International',
      'Al Maktoum',
    ])
  })

  it('reads a code and a city the same however they were typed', () => {
    const rows = [
      { city: 'Dubai', icao: 'OMDB' },
      { city: ' dubai ', icao: 'omdb' },
    ]

    expect(rankAirports(rows, 10)).toHaveLength(1)
  })

  it('cannot tell two airports apart when neither has a city or a code', () => {
    // The legacy de-duplication had the same blind spot; a row like that has nothing to show.
    expect(rankAirports([{ label: 'One' }, { label: 'Another' }], 10)).toHaveLength(1)
  })
})
