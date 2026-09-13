import { describe, expect, it } from 'vitest'

import { listingProblems, type YachtListing } from '@/lib/yachts'

/**
 * What makes a listing coherent (issue #65). Every column of both legacy tables is nullable, so
 * the rules are about agreement between fields rather than presence: see the note on
 * `listingProblems`.
 */
const charter: YachtListing = {
  listingType: 'charter',
  charter: { customerPrice: 1200, currency: 'EUR', cabins: '3+1' },
  sale: {},
}

const sale: YachtListing = {
  listingType: 'sale',
  charter: {},
  sale: { shipyard: 'Benetti', year: 2016 },
}

describe('a coherent listing', () => {
  it('has nothing to complain about', () => {
    expect(listingProblems(charter)).toEqual([])
    expect(listingProblems(sale)).toEqual([])
  })

  it('may leave everything blank, because every legacy column is nullable', () => {
    expect(listingProblems({ listingType: 'charter' })).toEqual([])
    expect(listingProblems({ listingType: 'sale', charter: {}, sale: {} })).toEqual([])
    expect(listingProblems({ listingType: 'charter', charter: null, sale: 'nonsense' })).toEqual([])
  })

  it('says nothing at all until a type is chosen, because Payload asks for that itself', () => {
    expect(listingProblems({})).toEqual([])
    expect(listingProblems({ listingType: 'something else' })).toEqual([])
  })
})

describe('fields of the other type', () => {
  it('are refused on a sale listing, so a flipped switch cannot keep an hourly price', () => {
    const problems = listingProblems({
      listingType: 'sale',
      charter: { customerPrice: 1200, currency: 'EUR' },
      sale: {},
    })

    expect(problems).toEqual([
      {
        path: 'charter',
        message: 'A sale listing cannot carry charter fields: currency, customerPrice.',
      },
    ])
  })

  it('are refused on a charter listing too', () => {
    const problems = listingProblems({
      listingType: 'charter',
      charter: { customerPrice: 1200, currency: 'EUR' },
      sale: { shipyard: 'Benetti' },
    })

    expect(problems).toEqual([
      { path: 'sale', message: 'A charter listing cannot carry sale fields: shipyard.' },
    ])
  })

  it('ignores a field that is blank, empty or an empty list', () => {
    expect(
      listingProblems({
        listingType: 'charter',
        charter: {},
        sale: { shipyard: '  ', year: null, cabins: undefined, extras: [] },
      }),
    ).toEqual([])
  })
})

describe('a price and its currency', () => {
  it('are refused one without the other, on a charter listing', () => {
    expect(listingProblems({ listingType: 'charter', charter: { customerPrice: 1200 } })).toEqual([
      {
        path: 'charter.currency',
        message: 'A price needs a currency: the listing card renders the two together.',
      },
    ])

    expect(listingProblems({ listingType: 'charter', charter: { currency: 'EUR' } })).toEqual([
      {
        path: 'charter.customerPrice',
        message: 'A currency needs a price: the listing card renders the two together.',
      },
    ])
  })

  it('are refused one without the other on a sale listing as well', () => {
    expect(listingProblems({ listingType: 'sale', sale: { price: 4_500_000 } })).toEqual([
      {
        path: 'sale.currency',
        message: 'A price needs a currency: the listing card renders the two together.',
      },
    ])

    expect(listingProblems({ listingType: 'sale', sale: { currency: 'USD' } })).toEqual([
      {
        path: 'sale.price',
        message: 'A currency needs a price: the listing card renders the two together.',
      },
    ])
  })

  it('leave the unrendered business price alone, which the legacy card never showed', () => {
    expect(listingProblems({ listingType: 'charter', charter: { businessPrice: 900 } })).toEqual([])
  })

  it('reports both problems at once when a listing has both', () => {
    const problems = listingProblems({
      listingType: 'sale',
      charter: { owner: 'Someone' },
      sale: { price: 4_500_000 },
    })

    expect(problems.map((problem) => problem.path)).toEqual(['charter', 'sale.currency'])
  })
})
