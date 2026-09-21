import { describe, expect, it } from 'vitest'

import {
  detailSource,
  directionSchema,
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

/**
 * The leg as it travels in the query and is recorded on the lead (issue #140, section 7.6). The
 * yacht detail page names a berth, a day, a number of hours and a number of guests, where the
 * flight request names a destination and passengers; the Leads collection and the Telegram
 * message have carried all of them since #152.
 */
describe('a direction', () => {
  const charter = { from: 'Dubai Marina', date: '2026-10-01', hours: 4, guests: 6 }

  it('takes the charter a yacht page asks for, with no passengers in it', () => {
    expect(directionSchema.safeParse(charter).success).toBe(true)
  })

  it('still takes the leg a flight request writes', () => {
    expect(directionSchema.safeParse(filled).success).toBe(true)
  })

  it('refuses hours and guests that no charter could mean', () => {
    expect(directionSchema.safeParse({ ...charter, hours: 0 }).success).toBe(false)
    expect(directionSchema.safeParse({ ...charter, guests: -1 }).success).toBe(false)
    expect(directionSchema.safeParse({ ...charter, hours: 10_000 }).success).toBe(false)
  })

  it('reaches the dialog whole, so the office is told how long and for how many', () => {
    const query = handoffQuery([charter], 'Yachts_detail')
    const [, direction] = /direction=([^&]+)/.exec(query) ?? []

    expect(JSON.parse(decodeURIComponent(direction ?? ''))).toEqual([charter])
  })
})

/**
 * What a detail page calls itself when it hands the dialog a leg (issue #153). The legacy
 * action wrote `showBooking=Yachts` from both pages, so a lead left on an aircraft page arrived
 * saying it came from the yachts and never said which aircraft
 * (`docs/legacy-inventory.md` section 13, entry 30).
 */
describe('detailSource', () => {
  it('names the page and the vehicle a visitor was reading about', () => {
    expect(detailSource('aircraft', 'ra-73025-gulfstream-g650')).toBe(
      'Aircraft_detail:ra-73025-gulfstream-g650',
    )
    expect(detailSource('yacht', 'azimut-serenity')).toBe('Yachts_detail:azimut-serenity')
  })

  it('tells the two pages apart, which the legacy did not', () => {
    expect(detailSource('aircraft', 'x')).not.toBe(detailSource('yacht', 'x'))
  })

  it('names the page alone when there is no slug to name', () => {
    // A row the import has not given a slug yet is still a page a lead can be left on.
    expect(detailSource('yacht', '')).toBe('Yachts_detail')
    expect(detailSource('aircraft', '   ')).toBe('Aircraft_detail')
  })

  it('survives the query it travels in', () => {
    const source = detailSource('aircraft', 'ra-73025')
    const query = new URLSearchParams(handoffQuery([emptyLeg()], source).slice(1))

    expect(query.get('showBooking')).toBe(source)
  })
})
