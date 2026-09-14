import { describe, expect, it } from 'vitest'

import { breadcrumbs, organisation, webSite, type SiteContact } from '@/lib/structured-data'

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
