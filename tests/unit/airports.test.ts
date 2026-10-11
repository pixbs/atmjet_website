import { describe, expect, it } from 'vitest'

import {
  airportOption,
  airportSearchText,
  normaliseCode,
  normaliseText,
  rankAirports,
  searchTerms,
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

  it('keeps airfields without codes apart by their names, which the legacy key could not', () => {
    // 11,650 imported airfields share their city, an administrative area, with another (#443).
    const rows = [
      { city: 'Moscow Oblast', label: 'Kievo' },
      { city: 'Moscow Oblast', label: 'Lyubertsy' },
      { city: 'Moscow Oblast', label: 'Kievo' },
    ]

    expect(rankAirports(rows, 10).map((one) => one.label)).toEqual(['Kievo', 'Lyubertsy'])
  })

  it('cannot tell two airports apart when they have neither a code, a city nor a name', () => {
    expect(rankAirports([{ passengersPerYear: 1 }, { passengersPerYear: 2 }], 10)).toHaveLength(1)
  })
})

/**
 * What a term is matched against (#443): the legacy search patched its misses one at a time
 * (`docs/legacy-inventory.md` sections 8.5 and 8.6: `ilike`, `saint`↔`st`, title-casing for
 * Cyrillic, a hard-coded Bilbao), and each of those cases is pinned here once.
 */
describe('airportSearchText', () => {
  const words = (airport: Parameters<typeof airportSearchText>[0]) =>
    airportSearchText(airport).split(' ')

  it('ignores case, accents, ё, apostrophes, dashes and punctuation', () => {
    expect(words({ name: 'Nice Côte d’Azur', city: 'ОРЁЛ', country: 'St.-Exupéry–Lyon' })).toEqual(
      expect.arrayContaining(['nice', 'cote', 'dazur', 'орел', 'exupery', 'lyon']),
    )
  })

  it('holds both spellings of a saint, as the legacy search re-queried them', () => {
    expect(words({ city: 'St. Louis County' })).toEqual(expect.arrayContaining(['st', 'saint']))
    expect(words({ name: 'Minneapolis–Saint Paul' })).toEqual(
      expect.arrayContaining(['st', 'saint', 'paul']),
    )
    expect(words({ name: 'Sainte-Marie' })).toEqual(expect.arrayContaining(['ste', 'sainte']))
  })

  it('holds every Cyrillic word in Latin letters too, so either script finds it', () => {
    // The English record of Tolmachevo names it after the town of Ob; only Russian says Novosibirsk.
    expect(words({ aliases: 'Новосибирск (Толмачёво)' })).toEqual(
      expect.arrayContaining(['новосибирск', 'novosibirsk', 'tolmachevo']),
    )
    expect(words({ city: 'Київ' })).toContain('kyiv')
  })

  it('leaves out a Latin reading short enough to be another word', () => {
    // Every Oak airfield is `Дуб` in Russian, and `dub` would rank them above Dubai.
    expect(words({ name: 'Белый Дуб' })).not.toContain('dub')
  })

  it('reads every language of a localized field, and both codes', () => {
    expect(
      words({ city: { en: 'Moscow', ru: 'Москва' }, icao: 'UUEE', iata: 'SVO', country: null }),
    ).toEqual(expect.arrayContaining(['moscow', 'москва', 'moskva', 'uuee', 'svo']))
  })
})

describe('searchTerms', () => {
  it('folds a term exactly as a name is folded', () => {
    expect(searchTerms(' Saint-Petersburg ')).toEqual([['saint'], ['petersburg']])
    expect(searchTerms("Côte d'Azur")).toEqual([['cote'], ['dazur']])
    expect(searchTerms('Орёл')).toEqual([['орел', 'orel']])
  })

  it('looks up nothing shorter than two characters, or punctuation alone', () => {
    expect(searchTerms('d')).toEqual([])
    expect(searchTerms('a.')).toEqual([])
    expect(searchTerms(' -- ')).toEqual([])
  })

  it('reads a long term only so far, because every word is a condition on a public endpoint', () => {
    expect(searchTerms(Array.from({ length: 50 }, (_, i) => `word${i}`).join(' ')).length).toBe(6)
  })
})

/** The order the list offers what matched (#443): code, word, traffic, in that weight. */
describe('rankAirports with a term', () => {
  interface Airport {
    name: string
    city?: string
    aliases?: string
    icao?: string
    iata?: string
    passengersPerYear?: number
  }
  const ranked = (term: string, airports: Airport[]) =>
    rankAirports(
      airports.map((airport) => ({
        ...airport,
        label: airport.name,
        search: airportSearchText(airport),
      })),
      10,
      term,
    ).map((airport) => airport.label)

  it('puts the airport whose code was typed before a busier one the letters are inside', () => {
    const riyadh = { name: 'King Khaled', icao: 'OERK', passengersPerYear: 30_000_000 }
    const pulkovo = { name: 'Pulkovo', iata: 'LED', passengersPerYear: 19_000_000 }

    expect(ranked('led', [riyadh, pulkovo])).toEqual(['Pulkovo', 'King Khaled'])
  })

  it('puts a whole word before a busier airport it only begins', () => {
    const heraklion = { name: 'Nikos Kazantzakis', icao: 'LGIR', passengersPerYear: 8_000_000 }
    const kazan = { name: 'Kazan', icao: 'UWKD', passengersPerYear: 4_600_000 }

    expect(ranked('Kazan', [heraklion, kazan])).toEqual(['Kazan', 'Nikos Kazantzakis'])
  })

  it('puts a city being typed before an unknown airport whose code it spells', () => {
    const moses = { name: 'Moses Point', iata: 'MOS' }
    const moscow = { name: 'Sheremetyevo', city: 'Moscow', passengersPerYear: 45_000_000 }

    expect(ranked('mos', [moses, moscow])).toEqual(['Sheremetyevo', 'Moses Point'])
    // In capitals it reads as the code it is.
    expect(ranked('MOS', [moses, moscow])).toEqual(['Moses Point', 'Sheremetyevo'])
  })

  it('puts every match at the start of a word before one inside a word, however busy', () => {
    const losAngeles = { name: 'Los Angeles', aliases: 'Municipal', passengersPerYear: 88_000_000 }
    const nice = { name: 'Nice', passengersPerYear: 14_000_000 }

    expect(ranked('nic', [losAngeles, nice])).toEqual(['Nice', 'Los Angeles'])
  })

  it('puts an airport with a code before an airfield without, all else equal', () => {
    const ranch = { name: 'Flying Eagle', city: 'Орел' }
    const orel = { name: 'Orel Yuzhny', city: 'Орёл', icao: 'UUOR' }

    expect(ranked('орел', [ranch, orel])).toEqual(['Orel Yuzhny', 'Flying Eagle'])
  })
})
