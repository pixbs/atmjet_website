import { describe, expect, it } from 'vitest'

import {
  emptyLeg,
  flightRequestSchema,
  handoffQuery,
  legSchema,
  MAX_LEGS,
} from '@/lib/flight-request'

/**
 * The rules a flight request has to meet (issue #151, `docs/legacy-inventory.md` section 7.1),
 * which are the legacy zod schema: a request the legacy site accepted is accepted here, and one
 * it refused is refused here.
 */
const filled = { from: 'Dubai (OMDB)', to: 'London (EGLL)', date: '2026-10-01', passengers: 2 }

describe('a leg', () => {
  it('needs somewhere to start and a day to leave on', () => {
    expect(legSchema.safeParse(filled).success).toBe(true)
    expect(legSchema.safeParse({ ...filled, from: '' }).success).toBe(false)
    expect(legSchema.safeParse({ ...filled, date: '' }).success).toBe(false)
  })

  it('takes a request that says only where it starts', () => {
    // The legacy destination is optional, and a leg left empty by the visitor arrives as ''.
    expect(legSchema.safeParse({ ...filled, to: '' }).success).toBe(true)
    expect(legSchema.safeParse({ from: 'Dubai', date: '2026-10-01', passengers: 1 }).success).toBe(
      true,
    )
  })

  it('refuses a day that is not a day', () => {
    expect(legSchema.safeParse({ ...filled, date: 'whenever' }).success).toBe(false)
    expect(legSchema.safeParse({ ...filled, returnDate: 'whenever' }).success).toBe(false)
    expect(legSchema.safeParse({ ...filled, returnDate: '2026-10-08' }).success).toBe(true)
    // A one-way leg in a round trip form has the field and leaves it empty.
    expect(legSchema.safeParse({ ...filled, returnDate: '' }).success).toBe(true)
  })

  it('carries at least one passenger, and a whole one', () => {
    expect(legSchema.safeParse({ ...filled, passengers: 0 }).success).toBe(false)
    expect(legSchema.safeParse({ ...filled, passengers: 1.5 }).success).toBe(false)
    expect(emptyLeg().passengers).toBe(1)
  })
})

describe('a request', () => {
  it('holds between one leg and the four the legacy offered', () => {
    expect(flightRequestSchema.safeParse({ legs: [] }).success).toBe(false)
    expect(flightRequestSchema.safeParse({ legs: [filled] }).success).toBe(true)
    expect(
      flightRequestSchema.safeParse({ legs: Array.from({ length: MAX_LEGS }, () => filled) })
        .success,
    ).toBe(true)
    expect(
      flightRequestSchema.safeParse({ legs: Array.from({ length: MAX_LEGS + 1 }, () => filled) })
        .success,
    ).toBe(false)
  })
})

describe('the handoff to the booking dialog', () => {
  it('carries the legs as the query the legacy dialog reads', () => {
    const query = handoffQuery([filled])
    const [, direction] = /direction=([^&]+)/.exec(query) ?? []

    expect(query.startsWith('?showBooking=Flight_request&direction=')).toBe(true)
    expect(JSON.parse(decodeURIComponent(direction ?? ''))).toEqual([filled])
  })

  it('leaves out what the visitor did not fill in', () => {
    // The legacy sent `to: ""` and `returnDate: ""` on to Telegram, where the message drew a row
    // for every value that was there (section 7.4).
    const query = handoffQuery([{ ...filled, to: '', returnDate: '' }])
    const [, direction] = /direction=([^&]+)/.exec(query) ?? []
    const [leg] = JSON.parse(decodeURIComponent(direction ?? '')) as Record<string, unknown>[]

    expect(leg).not.toHaveProperty('to')
    expect(leg).not.toHaveProperty('returnDate')
  })

  it('names the section the request came from, as the legacy query did', () => {
    expect(handoffQuery([filled], 'Transfer')).toContain('?showBooking=Transfer&')
  })
})
