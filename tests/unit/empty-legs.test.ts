import { describe, expect, it } from 'vitest'

import {
  compareEmptyLegs,
  departureIso,
  EMPTY_LEG_SORT,
  formatDepartureDate,
  LEGACY_DATE_LOCALE,
  parseDeparture,
} from '@/lib/empty-legs'

/**
 * The two legacy behaviours the empty legs listing has to reproduce (issue #66): an en-US date
 * whatever the page language, and the UTC day a `timestamptz` fell on
 * (`docs/legacy-inventory.md` section 6, EmptyLegCard).
 */
describe('parseDeparture', () => {
  it('takes an ISO string, a Date and an epoch', () => {
    expect(parseDeparture('2025-03-05T09:30:00.000Z')?.toISOString()).toBe(
      '2025-03-05T09:30:00.000Z',
    )
    expect(parseDeparture(new Date('2025-03-05T09:30:00Z'))?.toISOString()).toBe(
      '2025-03-05T09:30:00.000Z',
    )
    expect(parseDeparture(1_741_167_000_000)?.toISOString()).toBe('2025-03-05T09:30:00.000Z')
  })

  it('takes nothing from what is not a date', () => {
    expect(parseDeparture(undefined)).toBeUndefined()
    expect(parseDeparture(null)).toBeUndefined()
    expect(parseDeparture('the fifth of March')).toBeUndefined()
    expect(parseDeparture(new Date('nonsense'))).toBeUndefined()
    expect(parseDeparture({ start: '2025-03-05' })).toBeUndefined()
  })
})

describe('formatDepartureDate', () => {
  it('prints the legacy en-US long date', () => {
    expect(formatDepartureDate('2025-03-05T09:30:00.000Z')).toBe('March 5, 2025')
    expect(LEGACY_DATE_LOCALE).toBe('en-US')
  })

  it('prints the UTC day, not the day of whichever machine renders it', () => {
    // 23:30 UTC is still the fourth in Los Angeles and already the fifth in Dubai. The legacy
    // deployment ran in UTC, so the fourth is what the visitor saw.
    expect(formatDepartureDate('2025-03-04T23:30:00.000Z')).toBe('March 4, 2025')
    expect(formatDepartureDate('2025-03-05T00:30:00.000Z')).toBe('March 5, 2025')
  })

  it('has nothing to print when there is no date', () => {
    expect(formatDepartureDate(undefined)).toBeUndefined()
    expect(formatDepartureDate('soon')).toBeUndefined()
  })
})

describe('departureIso', () => {
  it('normalises whatever it is given to the instant Payload stores', () => {
    expect(departureIso('2025-03-05T09:30:00+03:00')).toBe('2025-03-05T06:30:00.000Z')
    expect(departureIso('not a date')).toBeUndefined()
  })
})

describe('compareEmptyLegs', () => {
  it('sorts by the order column the legacy site ignored', () => {
    expect(compareEmptyLegs({ order: 1 }, { order: 2 })).toBeLessThan(0)
    expect(compareEmptyLegs({ order: 3 }, { order: 2 })).toBeGreaterThan(0)
  })

  it('falls back to the departure when two legs share an order', () => {
    const earlier = { order: 1, departureAt: '2025-03-04T09:00:00.000Z' }
    const later = { order: 1, departureAt: '2025-03-05T09:00:00.000Z' }

    expect(compareEmptyLegs(earlier, later)).toBeLessThan(0)
    expect(compareEmptyLegs(later, earlier)).toBeGreaterThan(0)
    expect(compareEmptyLegs(earlier, earlier)).toBe(0)
  })

  it('puts a leg with no order last, so forgetting the number does not jump the queue', () => {
    expect(compareEmptyLegs({ order: 99 }, { order: null })).toBeLessThan(0)
    expect(compareEmptyLegs({}, { order: 99 })).toBeGreaterThan(0)
  })

  it('puts a leg with no readable departure last within its order', () => {
    const dated = { order: 1, departureAt: '2025-03-05T09:00:00.000Z' }

    expect(compareEmptyLegs(dated, { order: 1 })).toBeLessThan(0)
    expect(compareEmptyLegs({ order: 1 }, dated)).toBeGreaterThan(0)
    expect(compareEmptyLegs({ order: 1, departureAt: null }, { order: 1 })).toBe(0)
  })

  it('agrees with the sort Payload is asked for', () => {
    expect(EMPTY_LEG_SORT).toEqual(['order', 'departureAt'])

    const legs = [
      { order: 2, departureAt: '2025-01-01T00:00:00.000Z' },
      { order: null, departureAt: '2024-01-01T00:00:00.000Z' },
      { order: 1, departureAt: '2025-06-01T00:00:00.000Z' },
      { order: 1, departureAt: '2025-02-01T00:00:00.000Z' },
    ]

    expect([...legs].sort(compareEmptyLegs)).toEqual([legs[3], legs[2], legs[0], legs[1]])
  })
})
