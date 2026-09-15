import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { searchAirports } from '@/lib/data/airports'
import { createUser } from '../factories'
import { createRegistry, uniqueSuffix, type TestRegistry } from '../helpers/payload'

const revalidateTag = vi.hoisted(() => vi.fn())
vi.mock('next/cache', () => ({ revalidateTag }))

/**
 * The Airports collection (issue #64). It is reference data the public reads without a session,
 * so what is pinned here is the shape the empty legs block (E7.7) and the airport search
 * endpoint (E9.9) query, and that the normalisation actually runs on a write.
 */
let registry: TestRegistry

beforeAll(async () => {
  registry = await createRegistry()
})

afterAll(() => registry.cleanup())

const airport = (overrides: Record<string, unknown> = {}) => ({
  icao: `UU${uniqueSuffix().slice(-2).toUpperCase()}`,
  iata: 'SVO',
  name: 'Sheremetyevo International',
  city: 'Moscow',
  country: 'Russia',
  passengersPerYear: 49_837_000,
  ...overrides,
})

describe('normalisation on write', () => {
  it('stores codes upper-cased and stripped, whichever legacy table they came from', async () => {
    const created = await registry.create('airports', airport({ icao: ' uu dd ', iata: ' dme ' }))

    expect(created.icao).toBe('UUDD')
    expect(created.iata).toBe('DME')
  })

  it('collapses whitespace in names without changing their case', async () => {
    const created = await registry.create(
      'airports',
      airport({ name: '  Sheremetyevo   International ', city: ' Moscow ' }),
    )

    expect(created.name).toBe('Sheremetyevo International')
    expect(created.city).toBe('Moscow')
  })

  it('does not try to rescue a passenger count that arrives as legacy text', async () => {
    // Payload coerces a number field before the collection hook runs, so "49 837 000" is
    // already 49 by then and the truncation cannot be detected. The importer parses the legacy
    // text itself; this pins the reason the hook does not, so nobody adds it back expecting it
    // to work.
    const created = await registry.create(
      'airports',
      airport({ passengersPerYear: '49 837 000' as unknown as number }),
    )

    expect(created.passengersPerYear).toBe(49)
  })

  it('normalises on update as well as on create', async () => {
    const created = await registry.create('airports', airport())

    const updated = await registry.payload.update({
      collection: 'airports',
      id: created.id,
      data: { icao: ' ulli ' },
      overrideAccess: true,
    })

    expect(updated.icao).toBe('ULLI')
  })
})

describe('partial writes', () => {
  it('leaves alone the fields a write does not mention', async () => {
    const created = await registry.create('airports', airport())

    const updated = await registry.payload.update({
      collection: 'airports',
      id: created.id,
      data: { gmtOffset: '+03:00' },
      overrideAccess: true,
    })

    expect(updated.gmtOffset).toBe('+03:00')
    expect(updated.icao).toBe(created.icao)
    expect(updated.city).toBe('Moscow')
  })

  it('accepts an airport that has only a code, as the sparser legacy rows do', async () => {
    const created = await registry.create('airports', { icao: ` ek${uniqueSuffix().slice(-2)} ` })

    expect(created.icao).toMatch(/^EK/)
    expect(created.city).toBeFalsy()
  })
})

describe('lookup', () => {
  it('finds an airport by its exact ICAO code, without a wildcard match', async () => {
    const icao = `EG${uniqueSuffix().slice(-2).toUpperCase()}`
    await registry.create('airports', airport({ icao }))

    const found = await registry.payload.find({
      collection: 'airports',
      where: { icao: { equals: icao } },
      overrideAccess: false,
    })

    // The legacy did `ilike('%CODE%') limit 1`, which matched any airport containing the string.
    expect(found.totalDocs).toBe(1)
    expect(found.docs[0].icao).toBe(icao)
  })

  it('ranks by traffic, which the legacy text column could not', async () => {
    const marker = `RANK${uniqueSuffix().slice(-3).toUpperCase()}`
    await registry.create('airports', airport({ city: marker, passengersPerYear: 9 }))
    await registry.create('airports', airport({ city: marker, passengersPerYear: 1_000_000 }))

    const found = await registry.payload.find({
      collection: 'airports',
      where: { city: { equals: marker } },
      sort: '-passengersPerYear',
      overrideAccess: false,
    })

    expect(found.docs.map((doc) => doc.passengersPerYear)).toEqual([1_000_000, 9])
  })

  it('keeps a name per locale, so a Russian search can match a Russian name', async () => {
    const created = await registry.create('airports', airport({ city: 'Moscow' }))

    await registry.payload.update({
      collection: 'airports',
      id: created.id,
      data: { city: 'Москва' },
      locale: 'ru',
      overrideAccess: true,
    })

    const russian = await registry.payload.findByID({
      collection: 'airports',
      id: created.id,
      locale: 'ru',
    })

    expect(russian.city).toBe('Москва')
    expect((await registry.payload.findByID({ collection: 'airports', id: created.id })).city).toBe(
      'Moscow',
    )
  })
})

describe('indexes', () => {
  it('indexes every column the search and the lookup use', async () => {
    const config = await registry.payload.config
    const airports = config.collections.find((collection) => collection.slug === 'airports')
    const indexed = airports?.fields
      .filter((field) => 'index' in field && field.index)
      .map((field) => ('name' in field ? field.name : ''))

    // Section 8.5: the legacy autocomplete matched these columns, so each one is indexed here.
    expect(indexed).toEqual(
      expect.arrayContaining([
        'icao',
        'iata',
        'name',
        'city',
        'country',
        'aliases',
        'passengersPerYear',
      ]),
    )
  })
})

describe('access', () => {
  it('is readable without a session, because the search endpoint is public', async () => {
    await registry.create('airports', airport())

    const found = await registry.payload.find({ collection: 'airports', overrideAccess: false })

    expect(found.totalDocs).toBeGreaterThan(0)
  })

  it('is not writable anonymously', async () => {
    await expect(
      registry.payload.create({
        collection: 'airports',
        data: airport(),
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })

  it('is writable by an editor', async () => {
    const editor = await createUser(registry)

    const created = await registry.payload.create({
      collection: 'airports',
      data: airport(),
      overrideAccess: false,
      user: editor,
    })
    registry.track('airports', created.id)

    expect(created.id).toBeDefined()
  })
})

describe('coordinates', () => {
  it('refuses a coordinate outside the real range', async () => {
    await expect(registry.create('airports', airport({ latitude: 91 }))).rejects.toThrow()
  })

  it('accepts a coordinate inside it', async () => {
    const created = await registry.create(
      'airports',
      airport({ latitude: 55.972642, longitude: 37.414589 }),
    )

    expect(created.latitude).toBeCloseTo(55.972642)
  })
})

/**
 * The search behind the airport field (issue #159, `docs/legacy-inventory.md` section 8.5). The
 * legacy query matched ten columns — five fields in each of its two languages — and ordered by a
 * text column ascending, so the smallest airports came first.
 */
describe('the search the airport field reads', () => {
  const client = () => Promise.resolve(registry.payload)

  /** An airport in both languages, as the import of E5.5 leaves them. */
  async function airportIn(
    icao: string,
    en: [string, string, string],
    ru: [string, string, string],
    passengersPerYear?: number,
  ) {
    const created = await registry.create('airports', {
      icao,
      city: en[0],
      country: en[1],
      name: en[2],
      passengersPerYear,
    })

    await registry.payload.update({
      collection: 'airports',
      id: created.id,
      locale: 'ru',
      data: { city: ru[0], country: ru[1], name: ru[2] },
      overrideAccess: true,
    })

    return created
  }

  it('offers nothing until there are two characters to look up', async () => {
    // The legacy search returned the term itself below two characters and queried nothing.
    await expect(searchAirports({ term: 'd', locale: 'en' }, client)).resolves.toEqual([])
    await expect(searchAirports({ term: '  ', locale: 'en' }, client)).resolves.toEqual([])
  })

  it('ranks the busiest airport of a city first, where the legacy ranked the smallest', async () => {
    const marker = `Zarafshan${uniqueSuffix().slice(-5)}`
    await airportIn('ZZ01', [marker, 'Nowhere', 'Small field'], [marker, 'Нигде', 'Малое поле'], 9)
    await airportIn(
      'ZZ02',
      [marker, 'Nowhere', 'Big field'],
      [marker, 'Нигде', 'Большое поле'],
      1_000_000,
    )

    const options = await searchAirports({ term: marker, locale: 'en' }, client)

    expect(options).toEqual([
      `${marker} (ZZ02) Nowhere, Big field`,
      `${marker} (ZZ01) Nowhere, Small field`,
    ])
  })

  it('lists an airport nobody counted behind the ones that were counted', async () => {
    const marker = `Uncounted${uniqueSuffix().slice(-5)}`
    await airportIn('ZZ03', [marker, 'Nowhere', 'Unknown'], [marker, 'Нигде', 'Неизвестно'])
    await airportIn('ZZ04', [marker, 'Nowhere', 'Counted'], [marker, 'Нигде', 'Сосчитано'], 5)

    const options = await searchAirports({ term: marker, locale: 'en' }, client)

    expect(options[0]).toContain('Counted')
  })

  it('finds an airport by a name in the other language, and answers in this one', async () => {
    const marker = `Zvezda${uniqueSuffix().slice(-5)}`
    const cyrillic = `Звезда${uniqueSuffix().slice(-5)}`
    await airportIn('ZZ05', [marker, 'Nowhere', 'Star field'], [cyrillic, 'Нигде', 'Поле звезды'])

    // The legacy search matched both language columns and printed the page's language.
    await expect(searchAirports({ term: cyrillic, locale: 'en' }, client)).resolves.toEqual([
      `${marker} (ZZ05) Nowhere, Star field`,
    ])
    await expect(searchAirports({ term: marker, locale: 'ru' }, client)).resolves.toEqual([
      `${cyrillic} (ZZ05) Нигде, Поле звезды`,
    ])
  })

  it('matches a code as well as a name', async () => {
    const marker = `Coded${uniqueSuffix().slice(-5)}`
    const icao = `Z${uniqueSuffix().slice(-3).toUpperCase()}`
    await airportIn(icao, [marker, 'Nowhere', 'Coded field'], [marker, 'Нигде', 'Поле кода'], 7)

    await expect(searchAirports({ term: icao, locale: 'en' }, client)).resolves.toContain(
      `${marker} (${icao}) Nowhere, Coded field`,
    )
  })

  it('offers no more than the list has room for', async () => {
    const marker = `Crowded${uniqueSuffix().slice(-5)}`
    for (const index of [1, 2, 3]) {
      await airportIn(
        `ZY0${index}`,
        [`${marker} ${index}`, 'Nowhere', `Field ${index}`],
        [`${marker} ${index}`, 'Нигде', `Поле ${index}`],
        index,
      )
    }

    await expect(
      searchAirports({ term: marker, locale: 'en', limit: 2 }, client),
    ).resolves.toHaveLength(2)
  })

  it('offers nothing rather than an error when the database cannot be reached', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    await expect(
      searchAirports({ term: 'dubai', locale: 'en' }, () =>
        Promise.reject(new Error('connection refused')),
      ),
    ).resolves.toEqual([])
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })
})
