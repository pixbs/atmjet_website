import { describe, expect, it } from 'vitest'

import {
  airportName,
  departureLabel,
  discountLabel,
  priceLabel,
  regularPriceLabel,
  routeEndLabel,
} from '@/lib/empty-leg'

/**
 * How an empty leg reads on its card (issue #104, `docs/legacy-inventory.md` section 6). The
 * numbers are the legacy card's, kept on purpose: the owner confirmed on the issue that the
 * discount is real, because a repositioning flight is sold at a fraction of a charter.
 */
describe('departureLabel', () => {
  it('prints the long American date the legacy card printed', () => {
    expect(departureLabel('2026-03-05T09:00:00.000Z')).toBe('March 5, 2026')
  })

  it("prints the same day whatever the machine's time zone", () => {
    // The column is stored in UTC (`src/collections/EmptyLegs.ts`), and a leg that leaves just
    // after midnight UTC must not read as the day before.
    expect(departureLabel('2026-03-05T00:30:00.000Z')).toBe('March 5, 2026')
    expect(departureLabel('2026-03-05T23:30:00.000Z')).toBe('March 5, 2026')
  })

  it('takes a Date as readily as the string the API returns', () => {
    expect(departureLabel(new Date('2026-12-31T12:00:00.000Z'))).toBe('December 31, 2026')
  })

  it('prints nothing for a date it cannot read, rather than "Invalid Date"', () => {
    expect(departureLabel('not a date')).toBe('')
  })
})

describe('priceLabel', () => {
  it('prints whole units with separators, as the legacy dollar string did', () => {
    expect(priceLabel(12_000, 'USD')).toBe('$12,000')
  })

  it('prints the currency the leg is priced in, which the legacy could not', () => {
    // The legacy card hard-coded a dollar sign; a leg out of Dubai may be priced in dirhams
    // (`src/collections/EmptyLegs.ts`).
    // A currency with no symbol is spelled out and joined with a non-breaking space, which is
    // what keeps the code and the number on one line.
    expect(priceLabel(8_500, 'AED')).toBe('AED\u00a08,500')
    expect(priceLabel(8_500, 'EUR')).toBe('€8,500')
  })
})

describe('regularPriceLabel', () => {
  it('is two and a half times the price, as the struck-through figure was', () => {
    expect(regularPriceLabel(12_000, 'USD')).toBe('$30,000')
    expect(regularPriceLabel(100, 'USD')).toBe('$250')
  })
})

describe('discountLabel', () => {
  it('is the badge the legacy card printed', () => {
    expect(discountLabel()).toBe('-60%')
  })

  it('follows the multiple rather than being written out beside it', () => {
    // The legacy had `2.5` in one place and `-60%` in another, with nothing holding them together.
    expect(discountLabel(2)).toBe('-50%')
    expect(discountLabel(4)).toBe('-75%')
  })

  it('says nothing is off rather than dividing by nothing', () => {
    expect(discountLabel(0)).toBe('0%')
  })
})

describe('routeEndLabel', () => {
  it('names the airport and the code, as the legacy row did', () => {
    expect(routeEndLabel('omdb', 'Dubai')).toBe('Dubai(OMDB)')
  })

  it('keeps the code when no airport matched it', () => {
    // The legacy section dropped a leg whose code its wildcard lookup missed, so the route
    // vanished from the page entirely (`src/collections/EmptyLegs.ts`).
    expect(routeEndLabel('UUWW')).toBe('UUWW')
    expect(routeEndLabel('UUWW', '   ')).toBe('UUWW')
  })

  it('names the airport alone when the leg carries no code', () => {
    expect(routeEndLabel('', 'Geneva')).toBe('Geneva')
  })
})

describe('airportName', () => {
  it('names the city and the country, as the legacy section read them', () => {
    expect(airportName({ city: 'Dubai', country: 'United Arab Emirates' })).toBe(
      'Dubai, United Arab Emirates',
    )
  })

  it('leaves out what the airport does not have, rather than printing the comma', () => {
    // The legacy template returned `, Russia` for an airport it knew only the country of.
    expect(airportName({ country: 'Russia' })).toBe('Russia')
    expect(airportName({ city: 'Geneva', country: '  ' })).toBe('Geneva')
  })

  it('has no name for an airport it knows nothing about, so the code stands alone', () => {
    expect(airportName({})).toBeUndefined()
    expect(airportName({ city: null, country: null })).toBeUndefined()
  })
})
