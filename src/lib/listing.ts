/**
 * What a listing reads out of its URL (issue #135, `docs/conventions/rendering.md`).
 *
 * The legacy aircraft list kept its sort and its batch in React state, so the order a visitor
 * chose could not be linked to, a crawler saw the first paint of an empty list, and "show more"
 * dropped the sort on its way to the next batch (`docs/legacy-inventory.md` section 13, entries
 * 25 and 28). Here the URL is the state and the server renders what it says.
 *
 * `page` is how far the listing has been read rather than which slice is on screen: page two
 * shows the first two pages' worth, because the legacy button added the next batch under the
 * cards already read rather than replacing them. Filters arrive with the listing that has one
 * (the yachts page, issue #139); this one offers a sort and an order, as the legacy did.
 */
export type SearchParams = Record<string, string | string[] | undefined>

export type ListingDirection = 'asc' | 'desc'

/** What a listing offers and what it opens on: the shape a URL is read against. */
export interface ListingContract<Sort extends string> {
  /** The sorts on offer. The first is the one the listing opens on. */
  sorts: readonly [Sort, ...Sort[]]
  direction: ListingDirection
  perPage: number
  /** So a request for ten thousand cards is not one the database is asked for. */
  maxPerPage: number
}

export interface ListingQuery<Sort extends string> {
  page: number
  perPage: number
  sort: Sort
  direction: ListingDirection
}

/** A parameter written twice is read once; the first wins, as a form submits it. */
const first = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value

/** A count, or the default: anything that is not a whole number above zero says nothing. */
function counted(value: string | undefined, fallback: number): number {
  const parsed = Number(value)

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

/**
 * The query a URL describes. Nothing here throws: a parameter that means nothing falls back to
 * the default, so a listing opened from a mistyped link still answers with the first page.
 */
export function parseListing<Sort extends string>(
  params: SearchParams,
  contract: ListingContract<Sort>,
): ListingQuery<Sort> {
  const named = first(params.sort)
  const direction = first(params.direction)

  return {
    page: counted(first(params.page), 1),
    perPage: Math.min(counted(first(params.perPage), contract.perPage), contract.maxPerPage),
    sort: contract.sorts.find((sort) => sort === named) ?? contract.sorts[0],
    direction: direction === 'asc' || direction === 'desc' ? direction : contract.direction,
  }
}

/**
 * The query string a listing state is written as, without the leading `?`. Defaults are left
 * out and the rest are written in one order, so a listing has one URL per state: a crawler is
 * not given four addresses for the same cards and the cache holds one entry for them.
 */
export function listingSearch<Sort extends string>(
  query: ListingQuery<Sort>,
  contract: ListingContract<Sort>,
): string {
  const written = new URLSearchParams()

  if (query.sort !== contract.sorts[0]) written.set('sort', query.sort)
  if (query.direction !== contract.direction) written.set('direction', query.direction)
  if (query.perPage !== contract.perPage) written.set('perPage', String(query.perPage))
  if (query.page !== 1) written.set('page', String(query.page))

  return written.toString()
}
