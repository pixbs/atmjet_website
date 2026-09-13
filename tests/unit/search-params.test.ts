import { describe, expect, it } from 'vitest'

import {
  canonicalListingQuery,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  offsetFor,
  parseListingQuery,
  type ListingSchema,
} from '@/lib/data'

/**
 * The listing `searchParams` contract (issue #59, ADR-0007). The legacy listing kept sort and
 * filters in client state, so a listing URL could not be shared, cached or crawled; these tests
 * pin the replacement, including the rule that a malformed query falls back rather than throws.
 */
const schema = {
  sorts: ['year', 'passengers', 'range'],
  defaultDirection: 'desc',
  filters: { category: ['jet', 'turboprop', 'helicopter'] },
} satisfies ListingSchema<'year' | 'passengers' | 'range'>

describe('parseListingQuery', () => {
  it('falls back to the first sort and the defaults on an empty query', () => {
    expect(parseListingQuery({}, schema)).toEqual({
      page: 1,
      perPage: DEFAULT_PAGE_SIZE,
      sort: 'year',
      direction: 'desc',
      filters: {},
    })
  })

  it('reads a well-formed query', () => {
    const query = parseListingQuery(
      { page: '3', perPage: '24', sort: 'range', direction: 'asc', category: 'jet' },
      schema,
    )

    expect(query).toEqual({
      page: 3,
      perPage: 24,
      sort: 'range',
      direction: 'asc',
      filters: { category: ['jet'] },
    })
  })

  it('accepts a repeated filter and a comma-separated one alike', () => {
    expect(parseListingQuery({ category: ['jet', 'turboprop'] }, schema).filters).toEqual({
      category: ['jet', 'turboprop'],
    })
    expect(parseListingQuery({ category: 'jet,turboprop' }, schema).filters).toEqual({
      category: ['jet', 'turboprop'],
    })
  })

  it('drops filter values that are not in the allowlist', () => {
    expect(parseListingQuery({ category: 'jet,submarine' }, schema).filters).toEqual({
      category: ['jet'],
    })
    expect(parseListingQuery({ category: 'submarine' }, schema).filters).toEqual({})
  })

  it('ignores a filter the schema does not declare', () => {
    expect(parseListingQuery({ colour: 'gold' }, schema).filters).toEqual({})
  })

  it('falls back instead of throwing on a hand-edited query', () => {
    const query = parseListingQuery(
      { page: 'zero', perPage: '-4', sort: 'price', direction: 'sideways' },
      schema,
    )

    expect(query.page).toBe(1)
    expect(query.perPage).toBe(DEFAULT_PAGE_SIZE)
    expect(query.sort).toBe('year')
    expect(query.direction).toBe('desc')
  })

  it('rejects a page size that would let one request pull the whole table', () => {
    expect(parseListingQuery({ perPage: String(MAX_PAGE_SIZE + 1) }, schema).perPage).toBe(
      DEFAULT_PAGE_SIZE,
    )
    expect(parseListingQuery({ perPage: String(MAX_PAGE_SIZE) }, schema).perPage).toBe(
      MAX_PAGE_SIZE,
    )
  })

  it('takes the first value when a parameter repeats', () => {
    expect(parseListingQuery({ page: ['2', '9'] }, schema).page).toBe(2)
  })

  it('honours a per-listing page size', () => {
    expect(parseListingQuery({}, { ...schema, perPage: 9 }).perPage).toBe(9)
  })

  it('defaults the direction to ascending when the schema does not say', () => {
    expect(parseListingQuery({}, { sorts: ['name'] }).direction).toBe('asc')
  })
})

describe('canonicalListingQuery', () => {
  it('is empty for the default listing, so page one has no query string', () => {
    expect(canonicalListingQuery(parseListingQuery({}, schema), schema)).toBe('')
  })

  it('drops the values that equal the defaults', () => {
    const query = parseListingQuery(
      { page: '1', sort: 'year', direction: 'desc', perPage: String(DEFAULT_PAGE_SIZE) },
      schema,
    )

    expect(canonicalListingQuery(query, schema)).toBe('')
  })

  it('collapses two spellings of the same listing into one URL', () => {
    const repeated = parseListingQuery({ category: ['turboprop', 'jet'] }, schema)
    const commaSeparated = parseListingQuery({ category: 'jet,turboprop' }, schema)

    expect(canonicalListingQuery(repeated, schema)).toBe(
      canonicalListingQuery(commaSeparated, schema),
    )
    expect(canonicalListingQuery(repeated, schema)).toBe('?category=jet&category=turboprop')
  })

  it('puts the page last so paginated URLs of one listing sort together', () => {
    const query = parseListingQuery({ sort: 'range', page: '4', category: 'jet' }, schema)

    expect(canonicalListingQuery(query, schema)).toBe('?sort=range&category=jet&page=4')
  })

  it('survives a round trip through the parser', () => {
    const query = parseListingQuery(
      { sort: 'passengers', direction: 'asc', page: '2', category: 'helicopter' },
      schema,
    )
    const search = new URLSearchParams(canonicalListingQuery(query, schema).slice(1))
    const reparsed = parseListingQuery(Object.fromEntries(search.entries()), schema)

    expect(reparsed).toEqual(query)
  })
})

describe('canonicalListingQuery without schema defaults', () => {
  const bare = { sorts: ['name'] } as const satisfies ListingSchema<'name'>

  it('omits an ascending direction and the default page size', () => {
    expect(canonicalListingQuery(parseListingQuery({}, bare), bare)).toBe('')
  })

  it('keeps a direction and page size that differ from the defaults', () => {
    const query = parseListingQuery({ direction: 'desc', perPage: '30' }, bare)

    expect(canonicalListingQuery(query, bare)).toBe('?direction=desc&perPage=30')
  })
})

describe('offsetFor', () => {
  it('is zero on the first page', () => {
    expect(offsetFor(parseListingQuery({}, schema))).toBe(0)
  })

  it('counts whole pages', () => {
    expect(offsetFor(parseListingQuery({ page: '3', perPage: '10' }, schema))).toBe(20)
  })
})
