import { z } from 'zod'

/**
 * The `searchParams` contract for listing pages (ADR-0007: URL-driven state).
 *
 * The legacy aircraft listing kept sort and filters in client state, so "load more" dropped
 * them and no listing URL could be shared or crawled (`docs/legacy-inventory.md` section 4).
 * Here every knob lives in the URL, the server renders the filtered result, and anything
 * unparseable falls back to the default instead of throwing: a visitor who edits the query by
 * hand gets the first page, never an error screen.
 */
export const DEFAULT_PAGE_SIZE = 15
export const MAX_PAGE_SIZE = 60

export const SORT_DIRECTIONS = ['asc', 'desc'] as const
export type SortDirection = (typeof SORT_DIRECTIONS)[number]

/** What Next hands a page: a value may be absent, single or repeated. */
export type RawSearchParams = Record<string, string | string[] | undefined>

export interface ListingQuery<TSort extends string> {
  page: number
  perPage: number
  sort: TSort
  direction: SortDirection
  /** Empty when the visitor has not filtered; never undefined, so callers can spread it. */
  filters: Record<string, string[]>
}

/** Takes the first value when a parameter repeats, which is what a stray `?page=1&page=2` gives. */
function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

/** Splits a repeatable filter into its values: `?type=jet&type=turboprop` and `?type=jet,turboprop`. */
function many(value: string | string[] | undefined): string[] {
  const values = Array.isArray(value) ? value : value === undefined ? [] : [value]

  return values
    .flatMap((entry) => entry.split(','))
    .map((entry) => entry.trim())
    .filter((entry) => entry !== '')
}

export interface ListingSchema<TSort extends string> {
  /** Allowed sort keys, the first one being the default. */
  sorts: readonly TSort[]
  defaultDirection?: SortDirection
  /** Filter parameter names and the values each one accepts. */
  filters?: Record<string, readonly string[]>
  perPage?: number
}

/**
 * Parses a listing query out of `searchParams`. Unknown sort keys, out-of-range pages and
 * filter values that are not in the allowlist are dropped rather than rejected.
 */
export function parseListingQuery<TSort extends string>(
  raw: RawSearchParams,
  schema: ListingSchema<TSort>,
): ListingQuery<TSort> {
  const [defaultSort] = schema.sorts
  const perPageDefault = schema.perPage ?? DEFAULT_PAGE_SIZE

  const page = z.coerce
    .number()
    .int()
    .min(1)
    .catch(1)
    .parse(first(raw.page) ?? 1)

  const perPage = z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_PAGE_SIZE)
    .catch(perPageDefault)
    .parse(first(raw.perPage) ?? perPageDefault)

  const sort = z
    .enum(schema.sorts as unknown as [TSort, ...TSort[]])
    .catch(defaultSort)
    .parse(first(raw.sort) ?? defaultSort)

  const direction = z
    .enum(SORT_DIRECTIONS)
    .catch(schema.defaultDirection ?? 'asc')
    .parse(first(raw.direction) ?? schema.defaultDirection ?? 'asc')

  const filters: Record<string, string[]> = {}
  for (const [name, allowed] of Object.entries(schema.filters ?? {})) {
    const chosen = many(raw[name]).filter((value) => allowed.includes(value))
    if (chosen.length > 0) filters[name] = chosen
  }

  return { page, perPage, sort, direction, filters }
}

/**
 * Rebuilds the canonical query string for a parsed listing: defaults are omitted, filters are
 * sorted, and repeated values collapse. Two URLs that mean the same listing therefore produce
 * one canonical URL for crawlers and one cache entry.
 */
export function canonicalListingQuery<TSort extends string>(
  query: ListingQuery<TSort>,
  schema: ListingSchema<TSort>,
): string {
  const [defaultSort] = schema.sorts
  const defaultDirection = schema.defaultDirection ?? 'asc'
  const perPageDefault = schema.perPage ?? DEFAULT_PAGE_SIZE
  const params = new URLSearchParams()

  if (query.sort !== defaultSort) params.set('sort', query.sort)
  if (query.direction !== defaultDirection) params.set('direction', query.direction)
  if (query.perPage !== perPageDefault) params.set('perPage', String(query.perPage))

  for (const name of Object.keys(query.filters).sort()) {
    for (const value of [...query.filters[name]].sort()) {
      params.append(name, value)
    }
  }

  // Page last, so paginated URLs of one listing sort together in logs and sitemaps.
  if (query.page !== 1) params.set('page', String(query.page))

  const search = params.toString()
  return search === '' ? '' : `?${search}`
}

/** Offset for the Local API, derived so no caller recomputes it. */
export function offsetFor<TSort extends string>(query: ListingQuery<TSort>): number {
  return (query.page - 1) * query.perPage
}
