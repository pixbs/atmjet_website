import { describe, expect, it } from 'vitest'

import {
  currencyOf,
  fromContact,
  fromNewYacht,
  fromSaleYacht,
  type CharterContext,
  type NewYachtsRow,
  type SaleYachtsRow,
} from '../../scripts/migrate/yachts'

/**
 * What a charter row and a contact become (issue #81), away from a database: the free-text
 * currency, the slugs the legacy admin left empty or repeated, and the contacts no row has.
 */
const row = (fields: Partial<NewYachtsRow> = {}): NewYachtsRow => ({
  id: 5,
  name: 'Sea Breeze',
  slug: 'sea_breeze',
  description: 'A day out.\nLunch on board.',
  description_ru: 'Прогулка.',
  manufacturer: 'Azimut',
  owner: null,
  contact_id: 1,
  bussines_price: '900',
  customer_price: '1200',
  currency: 'AED',
  captain_id: null,
  location: 'Dubai Marina',
  length: '62.5',
  guests_day: '12',
  guests_night: null,
  cabins: '3+1',
  bathrooms: '2',
  refit: null,
  min_hours: '3',
  included: 'Капитан',
  included_en: 'Captain',
  photos: ['https://images.example.test/1.jpg', ' https://images.example.test/2.jpg '],
  ...fields,
})

const context = (fields: Partial<CharterContext> = {}): CharterContext => ({
  runId: 'run-3',
  importedAt: '2026-09-25T00:00:00.000Z',
  contacts: new Map([[1, 101]]),
  slugs: new Set(),
  imported: new Map(),
  ...fields,
})

describe('the currency column', () => {
  it.each([
    ['AED', 'AED'],
    [' aed ', 'AED'],
    ['Dirham', 'AED'],
    ['$', 'USD'],
    ['usd', 'USD'],
    ['€', 'EUR'],
    ['Euro', 'EUR'],
  ])('reads %j as %s', (text, currency) => {
    expect(currencyOf(text)).toBe(currency)
  })

  it.each(['Rubles', '', null])('knows no currency in %j', (text) => {
    expect(currencyOf(text)).toBeUndefined()
  })
})

describe('a contact row', () => {
  const at = { runId: 'run-3', importedAt: '2026-09-25T00:00:00.000Z' }

  it('keeps its details and where it came from', () => {
    expect(
      fromContact({ id: 4, name: ' Zed ', phone: '+971', email: 'a@example.test' }, at),
    ).toEqual({
      data: {
        name: 'Zed',
        phone: '+971',
        email: 'a@example.test',
        provenance: {
          origin: 'contact-legacy',
          legacyContactId: 4,
          importRunId: 'run-3',
          importedAt: at.importedAt,
        },
      },
    })
  })

  it('keeps an email the field would refuse outside it, and names a nameless contact', () => {
    expect(fromContact({ id: 4, name: null, phone: null, email: 'nobody' }, at).data).toMatchObject(
      {
        name: 'Contact 4',
        legacyAttributes: { email: 'nobody' },
      },
    )
    expect(
      fromContact({ id: 4, name: null, phone: null, email: 'nobody' }, at).data,
    ).not.toHaveProperty('email')
  })
})

describe('a charter row', () => {
  it('becomes a charter listing, with its Russian columns as the translation', () => {
    const { doc } = fromNewYacht(row(), context())

    expect(doc.data).toMatchObject({
      name: 'Sea Breeze',
      listingType: 'charter',
      slug: 'sea_breeze',
      length: 62.5,
      contact: 101,
      charter: {
        customerPrice: 1200,
        currency: 'AED',
        businessPrice: 900,
        minHours: 3,
        guestsDay: 12,
        cabins: '3+1',
        included: 'Captain',
      },
      provenance: { origin: 'new-yachts-charter', legacyId: 5, legacySlug: 'sea_breeze' },
    })
    expect(doc.translations?.ru).toMatchObject({ charter: { included: 'Капитан' } })
  })

  it('keeps the photos in the order of the array, trimmed', () => {
    expect(fromNewYacht(row(), context()).doc.data.photos).toEqual([
      { externalUrl: 'https://images.example.test/1.jpg' },
      { externalUrl: 'https://images.example.test/2.jpg' },
    ])
  })

  it('lists a contact or a captain no contact row has, and leaves it empty', () => {
    const { doc, orphans } = fromNewYacht(row({ contact_id: 9, captain_id: 1 }), context())

    expect(doc.data).not.toHaveProperty('contact')
    expect(doc.data).toMatchObject({ captain: 101 })
    expect(orphans).toEqual([{ yacht: 5, column: 'contact_id', contact: 9 }])
  })

  it('keeps a price in an unknown currency, both halves, outside the charter group', () => {
    const { data } = fromNewYacht(row({ currency: 'Rubles' }), context()).doc

    expect(data.charter).not.toHaveProperty('customerPrice')
    expect(data.charter).not.toHaveProperty('currency')
    expect(data.legacyAttributes).toEqual({ customer_price: '1200', currency: 'Rubles' })
  })

  it('makes a slug from the name where the legacy one was empty, and adds the id where it is taken', () => {
    expect(fromNewYacht(row({ slug: '', name: 'Звезда' }), context()).doc.data.slug).toBe('zvezda')
    expect(fromNewYacht(row({ slug: '_' }), context()).doc.data.slug).toBe('sea_breeze')
    expect(fromNewYacht(row(), context({ slugs: new Set(['sea_breeze']) })).doc.data.slug).toBe(
      'sea_breeze_5',
    )
  })

  it('keeps the slug an earlier run gave it', () => {
    expect(
      fromNewYacht(
        row(),
        context({ slugs: new Set(['sea_breeze_5']), imported: new Map([[5, 'sea_breeze_5']]) }),
      ).doc.data.slug,
    ).toBe('sea_breeze_5')
  })
})

describe('a sale row', () => {
  const sale = (fields: Partial<SaleYachtsRow> = {}): SaleYachtsRow => ({
    id: 8,
    name: 'Aurora',
    shipyard: 'Benetti',
    year: 2019,
    length: '120',
    beam: '25.5',
    draft: '8',
    cabins: 6,
    guests: 12,
    crew: 9,
    cruising_speed: 12,
    max_speed: 16,
    location: 'Monaco',
    pictures: ['https://images.example.test/a.jpg'],
    ...fields,
  })

  it('becomes a sale listing with every column in the sale group', () => {
    expect(fromSaleYacht(sale(), context()).data).toEqual({
      name: 'Aurora',
      listingType: 'sale',
      slug: 'aurora',
      location: 'Monaco',
      length: 120,
      photos: [{ externalUrl: 'https://images.example.test/a.jpg' }],
      sale: {
        shipyard: 'Benetti',
        year: 2019,
        beam: 25.5,
        draft: 8,
        cabins: 6,
        guests: 12,
        crew: 9,
        cruisingSpeed: 12,
        maxSpeed: 16,
      },
      provenance: {
        origin: 'yachts-sale',
        legacyId: 8,
        importRunId: 'run-3',
        importedAt: '2026-09-25T00:00:00.000Z',
      },
    })
  })

  it('takes its slug from the name, since the sale table had none', () => {
    expect(
      fromSaleYacht(sale({ name: 'Aurora' }), context({ slugs: new Set(['aurora']) })).data.slug,
    ).toBe('aurora_8')
    expect(fromSaleYacht(sale({ name: null }), context()).data).toMatchObject({
      name: 'yacht',
      slug: 'yacht',
    })
  })
})
