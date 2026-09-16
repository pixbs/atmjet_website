import type { ListingContract, ListingFilter, ListingQuery } from './listing'

/**
 * Yacht listings (issue #65).
 *
 * The legacy site kept two unrelated tables: `new_yachts`, the charter catalogue the admin
 * managed, and `yachts`, the sale catalogue (`docs/legacy-inventory.md` section 8). They share a
 * name, a location, a length and a pile of photos and agree on nothing else — charter prices are
 * hourly with a currency, sale yachts have a shipyard and speeds, charter cabins are text and
 * sale cabins are an integer.
 *
 * One collection with a `listingType` and two groups is the shape that keeps both. What it costs
 * is that "required" stops being a property of a field and becomes a property of a listing, which
 * is what this file works out.
 */

export const YACHT_LISTING_TYPES = ['charter', 'sale'] as const
type YachtListingType = (typeof YACHT_LISTING_TYPES)[number]

/** The currencies a listing may be priced in. The legacy column is free text (see the README of
 * the import, E5.10): anything outside this set is mapped there, not stored here. */
export const YACHT_CURRENCIES = ['AED', 'USD', 'EUR'] as const

export interface YachtListing {
  listingType?: unknown
  charter?: unknown
  sale?: unknown
}

export interface ListingProblem {
  path: string
  message: string
}

/** Whether an editor actually put something in a field, as opposed to leaving it blank. */
function isSet(value: unknown): boolean {
  if (value === undefined || value === null) return false
  if (typeof value === 'string') return value.trim() !== ''
  if (Array.isArray(value)) return value.length > 0

  return true
}

/** The names of the fields of a group that carry a value. */
function filledFields(group: unknown): string[] {
  if (group === null || typeof group !== 'object') return []

  return Object.entries(group as Record<string, unknown>)
    .filter(([, value]) => isSet(value))
    .map(([name]) => name)
    .sort()
}

function memberOf(group: unknown, field: string): unknown {
  if (group === null || typeof group !== 'object') return undefined

  return (group as Record<string, unknown>)[field]
}

/**
 * What is wrong with a listing, if anything.
 *
 * Deliberately short. Every column of both legacy tables is nullable, so making any of them
 * required would leave the import of E5.10 unable to land the rows it finds; what is checked is
 * coherence, which no legacy row can fail by accident:
 *
 * - a listing carries the fields of its own type and none of the other type's, so a sale yacht
 *   cannot quietly keep an hourly charter price after somebody flips the switch;
 * - a price has a currency and a currency has a price, because the legacy card rendered the two
 *   together (`{customerPrice} {currency} / per hour`) and one without the other renders a
 *   half-empty badge.
 */
export function listingProblems(data: YachtListing): ListingProblem[] {
  const type = data.listingType
  if (type !== 'charter' && type !== 'sale') return []

  const problems: ListingProblem[] = []

  const otherType: YachtListingType = type === 'sale' ? 'charter' : 'sale'
  const unexpected = filledFields(type === 'sale' ? data.charter : data.sale)
  if (unexpected.length > 0) {
    problems.push({
      path: otherType,
      message: `A ${type} listing cannot carry ${otherType} fields: ${unexpected.join(', ')}.`,
    })
  }

  const group = type === 'sale' ? data.sale : data.charter
  const priceField = type === 'sale' ? 'price' : 'customerPrice'
  const price = memberOf(group, priceField)
  const currency = memberOf(group, 'currency')

  if (isSet(price) && !isSet(currency)) {
    problems.push({
      path: `${type}.currency`,
      message: 'A price needs a currency: the listing card renders the two together.',
    })
  }

  if (isSet(currency) && !isSet(price)) {
    problems.push({
      path: `${type}.${priceField}`,
      message: 'A currency needs a price: the listing card renders the two together.',
    })
  }

  return problems
}

/**
 * The rows the sale card prints, in the order the legacy card printed them (issue #100,
 * `docs/legacy-inventory.md` section 6).
 *
 * The labels come from the caller, because the legacy card wrote all eight in English on a site
 * served in three languages (section 10.4). A row whose value an editor has not filled in is
 * printed empty rather than left out: the legacy card drew all eight whatever the row held, and
 * the ruled lines are what give the card its height.
 */
export interface SaleYachtFacts {
  /** Metres on the charter listings and feet on the sale ones, as the legacy tables held them. */
  length?: number | null
  location?: string | null
  sale?: {
    shipyard?: string | null
    year?: number | null
    beam?: number | null
    draft?: number | null
    cruisingSpeed?: number | null
    maxSpeed?: number | null
  } | null
}

export type SaleYachtSpecName =
  'shipyard' | 'year' | 'length' | 'beam' | 'draft' | 'cruisingSpeed' | 'maxSpeed' | 'location'

/** The wording of each row, and the unit the legacy card printed the length in. */
export type SaleYachtLabels = Record<SaleYachtSpecName, string> & { feet: string }

const printable = (value: string | number | null | undefined): string =>
  value === null || value === undefined ? '' : String(value).trim()

export function saleYachtSpecs(
  yacht: SaleYachtFacts,
  labels: SaleYachtLabels,
): { label: string; value: string }[] {
  const length = printable(yacht.length)

  const values: Record<SaleYachtSpecName, string> = {
    shipyard: printable(yacht.sale?.shipyard),
    year: printable(yacht.sale?.year),
    // `120 feet`, as the legacy card composed it.
    length: length === '' ? '' : `${length} ${labels.feet}`,
    beam: printable(yacht.sale?.beam),
    draft: printable(yacht.sale?.draft),
    cruisingSpeed: printable(yacht.sale?.cruisingSpeed),
    maxSpeed: printable(yacht.sale?.maxSpeed),
    location: printable(yacht.location),
  }

  return (Object.keys(values) as SaleYachtSpecName[]).map((name) => ({
    label: labels[name],
    value: values[name],
  }))
}

/**
 * What the charter listing sorts by (issue #139, `docs/legacy-inventory.md` section 4). The
 * legacy filter card offered these three and read them back out of the URL after a navigation,
 * which is more than it did for its filters.
 */
export const CHARTER_SORTS = ['price', 'length', 'guests'] as const

export type CharterSort = (typeof CHARTER_SORTS)[number]

/**
 * The three bands the legacy filter card narrowed the fleet with, by the name each goes under in
 * the URL and in the order its select offered them (issue #139, section 4): two of the three
 * ended on `All` and the length one began with it. All three open on `All`, so a band nobody
 * chose is left out of the address.
 *
 * The length select was named `lenght` on the form while the URL it wrote said `length`, and the
 * comparison behind it looked for a lowercase `all` the form never sent (section 13, entry 40).
 * The URL keeps the name it always had; the misspelling was the form field's own and nothing
 * outside the form ever saw it.
 */
export const CHARTER_FILTERS = {
  guests: { choices: ['15', '30', '60', '60+', 'All'], opensOn: 'All' },
  price: { choices: ['1200', '3500', 'Lux', 'All'], opensOn: 'All' },
  length: { choices: ['All', '20', '40', '60'], opensOn: 'All' },
} as const satisfies Record<string, ListingFilter>

/**
 * What each band means. `60+` is the one the legacy got wrong: its case had no `break`, so it
 * fell through into `All` and "more than 60 guests" showed the whole fleet (section 13, entry
 * 39). Here it means what it says.
 */
const BANDS: Record<keyof typeof CHARTER_FILTERS, Record<string, [number, number]>> = {
  // Both ends of a band count, as the legacy comparison read them: a yacht for thirty is both
  // "from fifteen to thirty" and "from thirty to sixty", and one for sixty is in "from thirty to
  // sixty" and in "more than 60" alike.
  guests: { '15': [0, 15], '30': [15, 30], '60': [30, 60], '60+': [60, Number.POSITIVE_INFINITY] },
  price: { '1200': [0, 1_200], '3500': [0, 3_500], Lux: [3_500, Number.POSITIVE_INFINITY] },
  length: { '20': [0, 20], '40': [20, 40], '60': [40, 60] },
}

/**
 * Whether a yacht is in every band that was asked for.
 *
 * A figure an editor has not filled in counts as zero, which is what the legacy comparison did
 * with `Number(x) || 0` — so an unpriced yacht still shows under the cheapest band. That is not
 * one of the defects section 13 lists, so it is reproduced rather than corrected.
 */
export function matchesCharter(
  yacht: CharterOrderable,
  filters: Readonly<Record<string, string>>,
): boolean {
  return (Object.keys(CHARTER_FILTERS) as (keyof typeof CHARTER_FILTERS)[]).every((name) => {
    const band = BANDS[name][filters[name] ?? 'All']
    if (!band) return true

    const measured =
      name === 'guests' ? yacht.guests : name === 'price' ? yacht.price : yacht.length
    const figure = typeof measured === 'number' && Number.isFinite(measured) ? measured : 0

    return figure >= band[0] && figure <= band[1]
  })
}

/**
 * The listing opens on price ascending, as the legacy select did. The page size is zero, which
 * means the whole result as it does to Payload's own `limit`: the legacy page read the entire
 * table and drew every row (section 13, entry 52), and a charter fleet is dozens of yachts
 * rather than thousands, so a listing that ends is what the page promises.
 */
export const CHARTER_LISTING: ListingContract<CharterSort> = {
  sorts: CHARTER_SORTS,
  direction: 'asc',
  perPage: 0,
  maxPerPage: 0,
  filters: CHARTER_FILTERS,
}

export type CharterQuery = ListingQuery<CharterSort>

/** The figures a charter listing is ordered by; any of them may be one nobody has filled in. */
export interface CharterOrderable {
  price?: number | null
  length?: number | null
  guests?: number | null
}

/**
 * The listing in the order its URL asks for (issue #139).
 *
 * In memory rather than in the query, because the whole fleet is read at once; the yachts
 * nobody has measured go last whichever way round the order is asked for, where a database would
 * have put them first under a descending sort and the legacy comparison read them as zero and
 * opened the list with them.
 */
export function sortedCharter<Yacht extends CharterOrderable>(
  yachts: readonly Yacht[],
  query: Pick<CharterQuery, 'sort' | 'direction'>,
): Yacht[] {
  const measure = (yacht: Yacht): number | null => {
    const value =
      query.sort === 'price' ? yacht.price : query.sort === 'length' ? yacht.length : yacht.guests

    return typeof value === 'number' && Number.isFinite(value) ? value : null
  }
  const turn = query.direction === 'desc' ? -1 : 1

  return [...yachts].sort((one, other) => {
    const left = measure(one)
    const right = measure(other)
    if (left === null || right === null) return left === right ? 0 : left === null ? 1 : -1

    return (left - right) * turn
  })
}
