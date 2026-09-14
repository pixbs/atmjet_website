/**
 * How an empty leg reads on its card (issue #104, `docs/legacy-inventory.md` section 6).
 *
 * The numbers are the legacy card's and stay that way: the owner confirmed on the issue that the
 * discount is real — an empty leg is a flight that is repositioning anyway, so it is sold at a
 * fraction of a charter. The multiple and the badge are one constant and one derived from it
 * here, because the legacy wrote `2.5` in one place and `-60%` in another and nothing held them
 * together.
 *
 * The date is `en-US` whatever the page language, which is what the legacy card printed and what
 * `src/collections/EmptyLegs.ts` records as the intent rather than an oversight.
 */

/**
 * What the same flight would cost chartered: the legacy strike-through price. Not exported —
 * the two labels below are the only way to ask, so the number and the badge cannot drift apart.
 */
const REGULAR_PRICE_MULTIPLE = 2.5

/** The formats the card prints in, whatever language the page is in. */
const FORMAT_LOCALE = 'en-US'

/** `-60%`, derived from the multiple above so the two can never disagree. */
export function discountLabel(multiple: number = REGULAR_PRICE_MULTIPLE): string {
  if (!Number.isFinite(multiple) || multiple <= 0) return '0%'

  return `-${Math.round((1 - 1 / multiple) * 100)}%`
}

/** `March 5, 2025`, from the UTC day the leg departs. */
export function departureLabel(departureAt: string | Date): string {
  const date = departureAt instanceof Date ? departureAt : new Date(departureAt)
  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleDateString(FORMAT_LOCALE, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

/**
 * `$12,000`, with no pennies, as `'$' + price.toLocaleString()` printed on the legacy card. The
 * currency comes from the document: the legacy hard-coded the dollar sign, and a leg out of
 * Dubai may be priced in dirhams (`src/collections/EmptyLegs.ts`).
 */
export function priceLabel(price: number, currency: string): string {
  return new Intl.NumberFormat(FORMAT_LOCALE, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price)
}

/** What the leg would cost chartered, in the same shape. */
export function regularPriceLabel(price: number, currency: string): string {
  return priceLabel(price * REGULAR_PRICE_MULTIPLE, currency)
}

/**
 * `Dubai(OMDB)`, or the code alone when no airport matched it. The legacy section dropped a leg
 * whose code it could not look up, so a route it did not recognise disappeared from the page
 * (`src/collections/EmptyLegs.ts`).
 */
export function routeEndLabel(icao: string, airport?: string | null): string {
  const code = icao.trim().toUpperCase()
  const name = (airport ?? '').trim()

  if (code === '') return name
  return name === '' ? code : `${name}(${code})`
}
