import { describe, expect, it } from 'vitest'

import {
  breadcrumbs,
  faqPage,
  organisation,
  product,
  webSite,
  type SiteContact,
} from '@/lib/structured-data'
import { prose } from '../../scripts/seed/prose'

/**
 * What the site tells a search engine about itself (issue #173). The legacy site emitted no
 * structured data at all, so nothing connected its pages to the company behind them.
 */
const ORIGIN = 'https://atmjet.com'

const CONTACT: SiteContact = {
  phone: '+971 (50) 458-99-26',
  email: 'info@atmjet.com',
  telegram: 'melentev1',
  instagram: 'atmjet',
}

describe('organisation', () => {
  it('gives a phone a search engine can dial, from the one an editor wrote', () => {
    // The legacy site displayed one number and dialled another (inventory section 13, entry 73).
    expect(organisation(ORIGIN, 'ATM JET', CONTACT).telephone).toBe('+971504589926')
  })

  it('names the profiles a crawler can follow', () => {
    expect(organisation(ORIGIN, 'ATM JET', CONTACT).sameAs).toEqual([
      'https://t.me/melentev1',
      'https://www.instagram.com/atmjet/',
    ])
  })

  it('claims no profile when an editor has left the handles empty', () => {
    const empty = organisation(ORIGIN, 'ATM JET', { ...CONTACT, telegram: '', instagram: '' })

    expect(empty.sameAs).toBeUndefined()
  })

  it('has an identity the rest of the graph can point at', () => {
    expect(organisation(ORIGIN, 'ATM JET', CONTACT)['@id']).toBe('https://atmjet.com/#organisation')
  })
})

describe('webSite', () => {
  it('points at the site in the language being read', () => {
    const site = webSite(ORIGIN, 'ru', 'ATM JET', 'Аренда самолета')

    expect(site.url).toBe('https://atmjet.com/ru')
    expect(site.inLanguage).toBe('ru')
  })

  it('names the organisation as its publisher, rather than repeating it', () => {
    expect(webSite(ORIGIN, 'en', 'ATM JET', 'Charter').publisher).toEqual({
      '@id': 'https://atmjet.com/#organisation',
    })
  })
})

describe('breadcrumbs', () => {
  it('leads from the home page to the page being read', () => {
    const trail = breadcrumbs(ORIGIN, 'en', 'Home', { slug: 'empty_legs', title: 'Empty legs' })

    expect(trail?.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://atmjet.com/en' },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Empty legs',
        item: 'https://atmjet.com/en/empty_legs',
      },
    ])
  })

  it('gives the home page no trail of its own', () => {
    // It is the first step of every other page's trail, not a trail with one step.
    expect(breadcrumbs(ORIGIN, 'en', 'Home', { slug: '', title: 'Home' })).toBeNull()
  })
})

describe('faqPage', () => {
  it('carries every question with the answer under it', () => {
    const answered = faqPage([
      { question: 'How far ahead do I book?', answer: prose('Two hours is enough.') },
      { question: 'What may I take?', answer: prose('What fits the hold.') },
    ])

    expect(answered?.mainEntity).toEqual([
      {
        '@type': 'Question',
        name: 'How far ahead do I book?',
        acceptedAnswer: { '@type': 'Answer', text: 'Two hours is enough.' },
      },
      {
        '@type': 'Question',
        name: 'What may I take?',
        acceptedAnswer: { '@type': 'Answer', text: 'What fits the hold.' },
      },
    ])
  })

  it('keeps the line breaks the answer was written with', () => {
    // The legacy answers are lists, and a search result reads one without its breaks as a
    // single run-on sentence (issue #72).
    const answered = faqPage([{ question: 'Where to?', answer: prose('Anywhere.\nAlmost.') }])

    expect(answered?.mainEntity).toMatchObject([{ acceptedAnswer: { text: 'Anywhere.\nAlmost.' } }])
  })

  it('says nothing at all on a page that asks nothing', () => {
    expect(faqPage([])).toBeNull()
  })
})

/**
 * One aircraft or one yacht (issue #173). Both detail pages describe what they are showing, so
 * a search result can carry the photograph and the price rather than a bare link.
 */
describe('product', () => {
  const YACHT = {
    slug: 'yachts/azimut-serenity',
    name: 'Azimut "Serenity"',
    description: 'A flybridge with room for twenty on deck.',
    images: ['/api/media/file/serenity.jpg', 'https://cdn.example.com/serenity-2.jpg'],
    brand: 'Azimut',
    hourlyPrice: { amount: 4500, currency: 'AED' },
  }

  it('points at the page it describes, in the language being read', () => {
    expect(product(ORIGIN, 'ru', YACHT).url).toBe('https://atmjet.com/ru/yachts/azimut-serenity')
  })

  it('gives every photograph a full address, whichever way it is stored', () => {
    // An upload of this site's own is a path by the time a component has it (`mediaSource`),
    // and structured data is read away from the page it came from.
    expect(product(ORIGIN, 'en', YACHT).image).toEqual([
      'https://atmjet.com/api/media/file/serenity.jpg',
      'https://cdn.example.com/serenity-2.jpg',
    ])
  })

  it('says the price is for an hour, which is how the fleet is quoted', () => {
    const offer = product(ORIGIN, 'en', YACHT).offers

    expect(offer).toMatchObject({
      priceCurrency: 'AED',
      priceSpecification: { price: 4500, priceCurrency: 'AED', unitCode: 'HUR' },
    })
  })

  it('offers no price for something quoted on request', () => {
    // The aircraft page asks for the leg instead of naming a figure, as the legacy page did.
    const aircraft = product(ORIGIN, 'en', {
      slug: 'aircraft/ra-73025',
      name: 'Gulfstream G650ER RA-73025',
      images: [],
      brand: 'Gulfstream',
    })

    expect(aircraft.offers).toBeUndefined()
    expect(aircraft.image).toBeUndefined()
  })

  it('leaves out what the catalogue has not recorded rather than saying it is empty', () => {
    const bare = product(ORIGIN, 'en', { slug: 'aircraft/m-ouse', name: 'M-OUSE', images: [] })

    expect(bare.description).toBeUndefined()
    expect(bare.brand).toBeUndefined()
  })

  it('names the company as the seller, the same one the site is published by', () => {
    expect(product(ORIGIN, 'en', YACHT).offers).toMatchObject({
      seller: { '@id': organisation(ORIGIN, 'ATM JET', CONTACT)['@id'] },
    })
  })
})
