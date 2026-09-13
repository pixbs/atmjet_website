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
