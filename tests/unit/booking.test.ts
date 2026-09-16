import { describe, expect, it } from 'vitest'

import { bookingSchema, campaignOf, parseDirections, submissionSchema } from '@/lib/booking'

/**
 * What the booking form asks for and what a submission of it may say (issues #152 and #154,
 * `docs/legacy-inventory.md` section 7.2). The three field rules are the legacy schema; the rest
 * is what a server action has to check for itself, being a public endpoint.
 */
const values = { name: 'A visitor', email: 'visitor@example.test', phone: '+971 50 458 99 26' }

const submission = {
  values,
  formType: 'booking-dialog' as const,
  source: 'Header',
  locale: 'en' as const,
  url: 'https://atmjet.com/en/empty_legs?utm_source=telegram',
}

describe('what the form asks for', () => {
  it('takes a name, an address and a number the legacy would have taken', () => {
    expect(bookingSchema.safeParse(values).success).toBe(true)
    expect(bookingSchema.safeParse({ ...values, name: '' }).success).toBe(false)
    expect(bookingSchema.safeParse({ ...values, name: 'a'.repeat(33) }).success).toBe(false)
    expect(bookingSchema.safeParse({ ...values, email: 'visitor@example' }).success).toBe(false)
    // Between eight and fifteen digits, however they are punctuated.
    expect(bookingSchema.safeParse({ ...values, phone: '+971 50' }).success).toBe(false)
    expect(bookingSchema.safeParse({ ...values, phone: `+${'9'.repeat(16)}` }).success).toBe(false)
  })

  it('takes the chips a visitor ticked, and none at all', () => {
    expect(bookingSchema.safeParse({ ...values, tags: ['press'] }).success).toBe(true)
    expect(bookingSchema.parse(values).tags).toBeUndefined()
  })
})

describe('what a submission may say', () => {
  it('accepts the one the form sends', () => {
    expect(submissionSchema.safeParse(submission).success).toBe(true)
  })

  it('refuses a form, a language or an itinerary the site does not have', () => {
    expect(submissionSchema.safeParse({ ...submission, formType: 'whatever' }).success).toBe(false)
    expect(submissionSchema.safeParse({ ...submission, locale: 'fr' }).success).toBe(false)
    expect(
      submissionSchema.safeParse({
        ...submission,
        directions: Array.from({ length: 5 }, () => ({
          from: 'Dubai',
          date: '2026-10-01',
          passengers: 1,
        })),
      }).success,
    ).toBe(false)
  })
})

describe('the legs a form was opened with', () => {
  it('reads the query the flight request handed over', () => {
    const legs = [{ from: 'Dubai', to: 'London', date: '2026-10-01', passengers: 2 }]

    expect(parseDirections(JSON.stringify(legs))).toEqual(legs)
  })

  it('keeps the hours and the guests a yacht page hands over', () => {
    // The Leads collection and the Telegram message have had rows for both since #152; what a
    // yacht page writes reaches them because the query is read against the same shape (#140).
    const charter = [{ from: 'Dubai Marina', date: '2026-10-01', hours: 4, guests: 6 }]

    expect(parseDirections(JSON.stringify(charter))).toEqual(charter)
  })

  it('answers with nothing where the legacy threw while the page was rendering', () => {
    // `JSON.parse(searchParams.get('direction'))` took the whole page down (section 13, entry 67).
    expect(parseDirections('{oops')).toBeUndefined()
    expect(parseDirections('[{"from":""}]')).toBeUndefined()
    expect(parseDirections(null)).toBeUndefined()
  })
})

describe('the campaign a lead arrived through', () => {
  it('reads the utm parameters off the page it was submitted from', () => {
    expect(campaignOf('https://atmjet.com/en?utm_source=telegram&utm_campaign=empty-legs')).toEqual(
      {
        source: 'telegram',
        campaign: 'empty-legs',
      },
    )
  })

  it('says nothing about a page that carried none, or an address that is not one', () => {
    expect(campaignOf('https://atmjet.com/en')).toEqual({})
    expect(campaignOf('not a url')).toEqual({})
  })
})
