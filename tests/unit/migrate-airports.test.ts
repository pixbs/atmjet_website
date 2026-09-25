import { describe, expect, it } from 'vitest'

import {
  airportDifferences,
  airportKey,
  fromAirports,
  fromNewAirports,
  type AirportsRow,
  type NewAirportsRow,
} from '../../scripts/migrate/airports'

/**
 * What a legacy airport row becomes (issue #77), away from a database: the two tables spell the
 * same facts differently, and a passenger count arrives as text (`docs/legacy-inventory.md`
 * section 8).
 */
const older = (row: Partial<AirportsRow> = {}): AirportsRow => ({
  id: 1,
  iata_code: 'DXB',
  icao_code: 'OMDB',
  name_rus: 'Дубай',
  name_eng: 'Dubai International',
  city_rus: 'Дубай',
  city_eng: 'Dubai',
  gmt_offset: '+4',
  country_rus: 'ОАЭ',
  country_eng: 'United Arab Emirates',
  iso_code: 'ae',
  latitude: '25.2528',
  longitude: '55.3644',
  ...row,
})

const newer = (row: Partial<NewAirportsRow> = {}): NewAirportsRow => ({
  id: 1,
  icao: 'OMDB',
  iata: 'DXB',
  label_en: 'Dubai International Airport',
  label_ru: 'Международный аэропорт Дубай',
  city_en: 'Dubai',
  city_ru: 'Дубай',
  country_en: 'United Arab Emirates',
  country_ru: 'ОАЭ',
  passengers_per_year: '86 994 365',
  type_en: 'large airport',
  type_ru: 'крупный аэропорт',
  alies_en: 'DXB',
  alies_ru: null,
  wikidata: 'Q220730',
  ...row,
})

describe('a row of the older airports table', () => {
  it('becomes the airport in English, with its Russian names as the translation', () => {
    expect(fromAirports(older())).toEqual({
      data: {
        icao: 'OMDB',
        iata: 'DXB',
        name: 'Dubai International',
        city: 'Dubai',
        country: 'United Arab Emirates',
        isoCode: 'AE',
        gmtOffset: '+4',
        latitude: 25.2528,
        longitude: 55.3644,
      },
      translations: { ru: { name: 'Дубай', city: 'Дубай', country: 'ОАЭ' } },
    })
  })

  it('stores a code one way, however the row spelled it', () => {
    expect(fromAirports(older({ icao_code: ' om db ', iata_code: 'dxb' })).data).toMatchObject({
      icao: 'OMDB',
      iata: 'DXB',
    })
  })

  it('reads a decimal comma, and leaves out a position it cannot read or that is off the globe', () => {
    expect(fromAirports(older({ latitude: '-33,9' })).data.latitude).toBe(-33.9)
    expect(fromAirports(older({ latitude: '95' })).data).not.toHaveProperty('latitude')
    expect(fromAirports(older({ longitude: 'east' })).data).not.toHaveProperty('longitude')
    expect(fromAirports(older({ longitude: '' })).data).not.toHaveProperty('longitude')
  })

  it('leaves out what the row left empty, so an update keeps what the other table wrote', () => {
    const { data, translations } = fromAirports(older({ icao_code: '', name_rus: '  ' }))

    expect(data).not.toHaveProperty('icao')
    expect(translations?.ru).not.toHaveProperty('name')
  })
})

describe('a row of the newer airports table', () => {
  it.each([
    ['86 994 365', 86994365],
    ['86,994,365', 86994365],
    ['1200.0', 1200],
    ['0', 0],
  ])('reads the passenger count %j as %d', (text, count) => {
    expect(fromNewAirports(newer({ passengers_per_year: text })).data.passengersPerYear).toBe(count)
  })

  it.each(['n/a', '', null, '-5', '1.2 million'])(
    'leaves out a passenger count it cannot read (%j)',
    (text) => {
      expect(fromNewAirports(newer({ passengers_per_year: text })).data).not.toHaveProperty(
        'passengersPerYear',
      )
    },
  )

  it('carries the misspelled alias columns and the type into both languages', () => {
    const { data, translations } = fromNewAirports(newer())

    expect(data).toMatchObject({ aliases: 'DXB', type: 'large airport', wikidata: 'Q220730' })
    expect(translations?.ru).toEqual({
      name: 'Международный аэропорт Дубай',
      city: 'Дубай',
      country: 'ОАЭ',
      type: 'крупный аэропорт',
    })
  })
})

describe('the airport a row is', () => {
  it('is its ICAO code', () => {
    expect(airportKey({ icao: 'OMDB', iata: 'DXB' })).toEqual({ icao: { equals: 'OMDB' } })
  })

  it('is its IATA code on an airport with no ICAO code', () => {
    expect(airportKey({ iata: 'ZAD' })).toEqual({
      and: [{ icao: { exists: false } }, { iata: { equals: 'ZAD' } }],
    })
  })

  it('is its Wikidata item when it has neither code, and nothing when it has none of the three', () => {
    expect(airportKey({ wikidata: 'Q1' })).toEqual({ wikidata: { equals: 'Q1' } })
    expect(airportKey({})).toEqual({ id: { equals: 0 } })
  })
})

describe('what the two tables disagree on', () => {
  it('names each fact both tables hold for one ICAO code and spell differently', () => {
    expect(airportDifferences([older()], [newer()])).toEqual([
      {
        icao: 'OMDB',
        field: 'label_en',
        legacy: 'Dubai International',
        newer: 'Dubai International Airport',
      },
      {
        icao: 'OMDB',
        field: 'label_ru',
        legacy: 'Дубай',
        newer: 'Международный аэропорт Дубай',
      },
    ])
  })

  it('matches the codes as they are stored, and ignores a value only one table has', () => {
    expect(
      airportDifferences(
        [older({ icao_code: 'omdb ', name_eng: '', name_rus: '' })],
        [newer({ city_en: '' })],
      ),
    ).toEqual([])
  })

  it('says nothing about an airport only one table has', () => {
    expect(airportDifferences([older({ icao_code: 'OMDW' })], [newer()])).toEqual([])
  })
})
