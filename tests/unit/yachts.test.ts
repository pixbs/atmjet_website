import { describe, expect, it } from 'vitest'

import {
  listingProblems,
  matchesCharter,
  saleYachtSpecs,
  sortedCharter,
  type SaleYachtLabels,
  type YachtListing,
} from '@/lib/yachts'

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

/**
 * The rows the sale card prints (issue #100, `docs/legacy-inventory.md` section 6). The legacy
 * card drew all eight whatever the row held, and composed the length as `120 feet`.
 */
const LABELS: SaleYachtLabels = {
  shipyard: 'Shipyard:',
  year: 'Year built:',
  length: 'Length:',
  beam: 'Beam:',
  draft: 'Draft:',
  cruisingSpeed: 'Cruising speed:',
  maxSpeed: 'Max speed:',
  location: 'Location:',
  feet: 'feet',
}

describe('saleYachtSpecs', () => {
  it('prints the eight rows in the order the legacy card printed them', () => {
    const specs = saleYachtSpecs(
      {
        length: 120,
        location: 'Monaco',
        sale: {
          shipyard: 'Benetti',
          year: 2019,
          beam: 25,
          draft: 8,
          cruisingSpeed: 12,
          maxSpeed: 16,
        },
      },
      LABELS,
    )

    expect(specs).toEqual([
      { label: 'Shipyard:', value: 'Benetti' },
      { label: 'Year built:', value: '2019' },
      { label: 'Length:', value: '120 feet' },
      { label: 'Beam:', value: '25' },
      { label: 'Draft:', value: '8' },
      { label: 'Cruising speed:', value: '12' },
      { label: 'Max speed:', value: '16' },
      { label: 'Location:', value: 'Monaco' },
    ])
  })

  it('keeps the row and empties the value where a listing has nothing to say', () => {
    // The ruled lines are what give the card its height, so the legacy drew them regardless.
    const specs = saleYachtSpecs({ sale: { shipyard: 'Sunseeker' } }, LABELS)

    expect(specs).toHaveLength(8)
    expect(specs.filter((spec) => spec.value !== '')).toEqual([
      { label: 'Shipyard:', value: 'Sunseeker' },
    ])
  })

  it('prints a measurement of zero rather than reading it as nothing', () => {
    const specs = saleYachtSpecs({ length: 0, sale: { draft: 0 } }, LABELS)

    expect(specs).toContainEqual({ label: 'Length:', value: '0 feet' })
    expect(specs).toContainEqual({ label: 'Draft:', value: '0' })
  })
})

/**
 * The order the charter listing is read in (issue #139, `docs/legacy-inventory.md` section 4).
 * The legacy page sorted in the browser and read a missing figure as zero, so the yachts nobody
 * had measured opened the list under "the largest first".
 */
describe('sortedCharter', () => {
  const fleet = [
    { name: 'unmeasured' },
    { name: 'small', price: 1_000, length: 40, guests: 8 },
    { name: 'large', price: 9_000, length: 110, guests: 45 },
    { name: 'middling', price: 4_500, length: 78, guests: 20 },
  ]
  const names = (yachts: { name: string }[]) => yachts.map((yacht) => yacht.name)

  it('orders by the figure the URL names', () => {
    expect(names(sortedCharter(fleet, { sort: 'price', direction: 'asc' }))).toEqual([
      'small',
      'middling',
      'large',
      'unmeasured',
    ])
    expect(names(sortedCharter(fleet, { sort: 'guests', direction: 'asc' }))).toEqual([
      'small',
      'middling',
      'large',
      'unmeasured',
    ])
  })

  it('turns the order round without moving what has no figure', () => {
    const up = sortedCharter(fleet, { sort: 'length', direction: 'asc' })
    const down = sortedCharter(fleet, { sort: 'length', direction: 'desc' })

    expect(names(down).slice(0, -1)).toEqual(names(up).slice(0, -1).reverse())
    expect(names(down).at(-1)).toBe('unmeasured')
  })

  it('leaves the fleet it was given alone', () => {
    const order = names(fleet)
    sortedCharter(fleet, { sort: 'price', direction: 'desc' })

    expect(names(fleet)).toEqual(order)
  })

  it('reads a figure that is not a number as one nobody has filled in', () => {
    // The legacy comparison ran every value through `Number(...) || 0`, so a blank column sorted
    // as the cheapest, the shortest and the emptiest yacht in the fleet.
    const odd = [
      { name: 'blank', price: Number.NaN },
      { name: 'priced', price: 500 },
    ]

    expect(names(sortedCharter(odd, { sort: 'price', direction: 'asc' }))).toEqual([
      'priced',
      'blank',
    ])
  })
})

/**
 * The three bands the charter card narrows the fleet with (issue #139, section 4). The legacy
 * comparison ran in the browser on every navigation and got one of them wrong.
 */
describe('matchesCharter', () => {
  const yacht = { price: 4_500, length: 78, guests: 20 }
  const all = { guests: 'All', price: 'All', length: 'All' }

  it('lets the whole fleet through when nothing was narrowed', () => {
    expect(matchesCharter(yacht, all)).toBe(true)
    expect(matchesCharter({}, all)).toBe(true)
  })

  it('puts a yacht on the boundary in the band whose label claims it', () => {
    // Both ends of a band count, so a yacht for exactly thirty is in the band that ends at
    // thirty and the one that begins there — both labels say so. `60+` reads "more than 60",
    // and the band below it already claims a yacht for sixty, so that one is the exception.
    expect(matchesCharter({ guests: 30 }, { ...all, guests: '30' })).toBe(true)
    expect(matchesCharter({ guests: 30 }, { ...all, guests: '60' })).toBe(true)
    expect(matchesCharter({ guests: 60 }, { ...all, guests: '60' })).toBe(true)
    expect(matchesCharter({ guests: 60 }, { ...all, guests: '60+' })).toBe(false)
    expect(matchesCharter({ guests: 61 }, { ...all, guests: '60+' })).toBe(true)
  })

  it('keeps a yacht only where every band asked for takes it', () => {
    expect(matchesCharter(yacht, { ...all, guests: '30', price: 'Lux' })).toBe(true)
    // In the guests band but out of the price one.
    expect(matchesCharter(yacht, { ...all, guests: '30', price: '1200' })).toBe(false)
  })

  it('means what it says by more than sixty guests', () => {
    // The legacy case had no `break` and fell through into `All`, so the band that promised the
    // largest yachts showed every one of them (section 13, entry 39).
    const large = { guests: 90 }

    expect(matchesCharter(large, { ...all, guests: '60+' })).toBe(true)
    expect(matchesCharter(yacht, { ...all, guests: '60+' })).toBe(false)
  })

  it('reads a figure nobody has filled in as zero, as the legacy comparison did', () => {
    // `Number(x) || 0`, so an unpriced yacht still shows under the cheapest band. Not one of the
    // defects section 13 lists, so it is reproduced rather than corrected.
    expect(matchesCharter({}, { ...all, price: '1200' })).toBe(true)
    expect(matchesCharter({}, { ...all, price: 'Lux' })).toBe(false)
  })

  it('takes a band it does not offer as no band at all', () => {
    expect(matchesCharter(yacht, { ...all, price: 'nonsense' })).toBe(true)
  })
})
