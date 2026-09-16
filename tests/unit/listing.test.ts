import { describe, expect, it } from 'vitest'

import { listingSearch, parseListing, type ListingContract } from '@/lib/listing'

/**
 * What a listing reads out of its URL and writes back into one (issue #135,
 * `docs/conventions/rendering.md`). The legacy list kept the same state in React, so the order a
 * visitor chose could not be linked to and "show more" lost it
 * (`docs/legacy-inventory.md` section 13, entries 25 and 28).
 *
 * The contract here is the suite's own, so what is asserted is how a URL is read rather than
 * which sorts the aircraft page happens to offer.
 */
const CONTRACT: ListingContract<'newest' | 'price'> = {
  sorts: ['newest', 'price'],
  direction: 'asc',
  perPage: 10,
  maxPerPage: 30,
  // `any` is offered last and is still what the listing opens on, as the legacy yachts
  // selects were (`docs/legacy-inventory.md` section 4).
  filters: { colour: { choices: ['red', 'blue', 'any'], opensOn: 'any' } },
}

describe('reading a listing URL', () => {
  it('opens on the first sort and the order the listing names', () => {
    expect(parseListing({}, CONTRACT)).toEqual({
      page: 1,
      perPage: CONTRACT.perPage,
      sort: 'newest',
      direction: 'asc',
      filters: { colour: 'any' },
    })
  })

  it('takes a sort and an order the listing offers', () => {
    const query = parseListing({ sort: 'price', direction: 'desc' }, CONTRACT)

    expect(query.sort).toBe('price')
    expect(query.direction).toBe('desc')
  })

  it('falls back rather than throwing on anything it cannot make sense of', () => {
    // A mistyped link still answers with a listing, which is what a crawler follows.
    const query = parseListing(
      { sort: 'cheapness', direction: 'sideways', page: 'two', perPage: '-1' },
      CONTRACT,
    )

    expect(query).toEqual(parseListing({}, CONTRACT))
  })

  it('caps how many one request may ask for', () => {
    const query = parseListing({ perPage: '5000' }, CONTRACT)

    expect(query.perPage).toBe(CONTRACT.maxPerPage)
    expect(parseListing({ perPage: '12' }, CONTRACT).perPage).toBe(12)
  })

  it('reads a parameter written twice as the one a form would have submitted', () => {
    expect(parseListing({ sort: ['price', 'newest'] }, CONTRACT).sort).toBe('price')
  })

  it('takes a filter the listing offers, and falls back where it does not', () => {
    expect(parseListing({ colour: 'blue' }, CONTRACT).filters.colour).toBe('blue')
    expect(parseListing({ colour: 'puce' }, CONTRACT).filters.colour).toBe('any')
  })
})

describe('writing a listing URL', () => {
  it('leaves out what the listing opens on, so one state is one address', () => {
    expect(listingSearch(parseListing({}, CONTRACT), CONTRACT)).toBe('')
  })

  it('writes what a visitor changed, and nothing else', () => {
    const query = parseListing({ sort: 'price', page: '3' }, CONTRACT)

    expect(listingSearch(query, CONTRACT)).toBe('sort=price&page=3')
  })

  it('leaves a filter out while it is the one the listing opens on', () => {
    expect(listingSearch(parseListing({ colour: 'any' }, CONTRACT), CONTRACT)).toBe('')
    expect(listingSearch(parseListing({ colour: 'red' }, CONTRACT), CONTRACT)).toBe('colour=red')
  })

  it('writes the same state the same way round, whatever order it was read in', () => {
    const one = parseListing({ page: '2', direction: 'desc', sort: 'price' }, CONTRACT)
    const other = parseListing({ sort: 'price', page: '2', direction: 'desc' }, CONTRACT)

    expect(listingSearch(one, CONTRACT)).toBe(listingSearch(other, CONTRACT))
  })

  it('reads back into the state it was written from', () => {
    const query = parseListing(
      { sort: 'price', direction: 'desc', page: '4', perPage: '25' },
      CONTRACT,
    )
    const written = new URLSearchParams(listingSearch(query, CONTRACT))

    expect(parseListing(Object.fromEntries(written.entries()), CONTRACT)).toEqual(query)
  })
})
