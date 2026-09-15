import { describe, expect, it } from 'vitest'

import { bookingSchema, submissionSchema } from '@/lib/booking'
import { legSchema, MAX_LEGS } from '@/lib/flight-request'
import { LEAD_TAGS_MAX } from '@/lib/leads'
import { leadMessage, readTelegramSettings } from '@/lib/telegram'
import type { Lead } from '@/payload-types'

/**
 * The message a lead becomes (issues #155 and #161, `docs/legacy-inventory.md` section 7.4).
 *
 * The desk reads this channel every day, so the message is the legacy one word for word; what
 * changes is the escaping, which the legacy `mdEscape` got wrong in two ways (section 13,
 * entry 61).
 */
type LeadMessageFields = Parameters<typeof leadMessage>[0]

function lead(overrides: Partial<LeadMessageFields> = {}): LeadMessageFields {
  return {
    name: 'A. Visitor',
    email: 'visitor@example.test',
    phone: '+971 (50) 458-99-26',
    tags: ['Jet', 'Yacht'],
    locale: 'en',
    source: 'Header',
    page: { url: 'https://atmjet.com/en/empty_legs' },
    directions: [{ from: 'DXB', to: 'LHR', date: '2026-10-01', passengers: 4 }],
    ...overrides,
  } as LeadMessageFields
}

describe('the message a lead is sent as', () => {
  it('is the message the legacy site sent, line for line', () => {
    expect(leadMessage(lead())).toBe(
      [
        '*🚀  New Booking Request*',
        '──────────────',
        '👤 *Name:* A\\. Visitor',
        '🌐 *Locale:* en',
        '💼 *Component:* Header',
        '',
        '📞 *Phone:* `+971(50)458-99-26`',
        '✉️ *Email:* visitor@example\\.test',
        '',
        '🏷️ *Tags:* Jet, Yacht',
        '',
        '*1\\. Direction*',
        '*From:* DXB',
        '*To:* LHR',
        '*Date:* 2026\\-10\\-01',
        '*Passengers:* 4',
        '',
        '🔗 From https://atmjet\\.com/en/empty\\_legs',
      ].join('\n'),
    )
  })

  it('escapes the backslash the legacy escape missed, which Telegram refused the message for', () => {
    // `mdEscape` left `\` out of its set, so a name carrying one produced malformed MarkdownV2
    // and the whole lead was rejected by the API (section 13, entry 61).
    expect(leadMessage(lead({ name: 'C:\\Users' }))).toContain('👤 *Name:* C:\\\\Users')
  })

  it('leaves the phone number dialable, where the legacy drew backslashes through it', () => {
    // Inside a code span Telegram reads only a backtick and a backslash; escaping `+` and `-`
    // there, as the legacy did, put the backslashes on the screen.
    expect(leadMessage(lead({ phone: '+1 (555) 010-9999' }))).toContain(
      '📞 *Phone:* `+1(555)010-9999`',
    )
  })

  it('says so when there are no tags and no itinerary', () => {
    const message = leadMessage(lead({ tags: [], directions: [] }))

    expect(message).toContain('🏷️ *Tags:* None')
    expect(message).toContain('*No directions*')
  })

  it('numbers every leg and draws only the rows a leg has values in', () => {
    const message = leadMessage(
      lead({
        directions: [
          { from: 'DXB', to: 'LHR', passengers: 0 },
          { from: 'LHR', to: 'DXB', date: '2026-10-08', returnDate: '', guests: 2, hours: 6 },
        ],
      }),
    )

    // `0` passengers is a value, as it was for the legacy `add`; an empty string is not.
    expect(message).toContain(
      ['*1\\. Direction*', '*From:* DXB', '*To:* LHR', '*Passengers:* 0'].join('\n'),
    )
    expect(message).toContain(
      [
        '*2\\. Direction*',
        '*From:* LHR',
        '*To:* DXB',
        '*Date:* 2026\\-10\\-08',
        '*Guests:* 2',
        '*Hours:* 6',
      ].join('\n'),
    )
    expect(message).not.toContain('*Return:*')
  })

  it('draws the lines a lead has nothing for, rather than leaving them out', () => {
    // A lead created by hand in the admin need not carry a locale, a source or a page.
    const message = leadMessage({
      name: 'No context',
      email: 'quiet@example.test',
      phone: '+971504589926',
    } as Lead)

    expect(message).toContain('🌐 *Locale:* \n')
    expect(message).toContain('🔗 From ')
  })
})

describe('the variables the dispatch needs', () => {
  it('reads the token and splits the chat ids, trimming what is between them', () => {
    const read = readTelegramSettings({
      TELEGRAM_BOT_TOKEN: ' 123:abc ',
      TELEGRAM_CHAT_IDS: ' -100123 , 456 ,',
    })

    expect(read).toEqual({ ok: true, settings: { token: '123:abc', chatIds: ['-100123', '456'] } })
  })

  it('names what is missing instead of throwing, whichever it is', () => {
    // The legacy module threw as it was imported, so a deployment without the variables broke
    // every page that led to a form rather than the one send it could not make (issue #161).
    expect(readTelegramSettings({})).toEqual({
      ok: false,
      missing: ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_IDS'],
    })
    expect(
      readTelegramSettings({ TELEGRAM_BOT_TOKEN: '123:abc', TELEGRAM_CHAT_IDS: ' , ' }),
    ).toEqual({ ok: false, missing: ['TELEGRAM_CHAT_IDS'] })
  })
})

/**
 * A lead that is too long to send is not delivered late, it is never delivered: the job's three
 * attempts all fail the same way (issue #154). So every field a visitor fills in is bounded
 * where it is submitted, and this is the check that the bounds are the right ones — the largest
 * submission the schemas accept still fits in one message.
 *
 * The lengths are asked of the schemas rather than copied from them, so this keeps testing the
 * rule that is actually enforced rather than a number written down twice.
 */
describe('the longest lead a visitor can submit', () => {
  /** The longest value of this shape the schema still accepts. */
  function longestAccepted(accepts: (length: number) => boolean): number {
    let length = 1
    while (length < 4096 && accepts(length + 1)) length += 1

    return length
  }

  const filled = (length: number) => 'ю'.repeat(length)

  const nameLength = longestAccepted(
    (length) =>
      bookingSchema.safeParse({
        name: filled(length),
        email: 'a@b.co',
        phone: '+971504589926',
      }).success,
  )

  const tagLength = longestAccepted(
    (length) =>
      bookingSchema.safeParse({
        name: 'A',
        email: 'a@b.co',
        phone: '+971504589926',
        tags: [filled(length)],
      }).success,
  )

  const airportLength = longestAccepted(
    (length) =>
      legSchema.safeParse({ from: filled(length), date: '2026-09-15', passengers: 1 }).success,
  )

  const passengers = longestAccepted(
    (count) => legSchema.safeParse({ from: 'A', date: '2026-09-15', passengers: count }).success,
  )

  const values = bookingSchema.parse({
    name: filled(nameLength),
    email: `${'e'.repeat(240)}@example.com`,
    phone: '+971 (50) 458-99-26',
    tags: Array.from({ length: LEAD_TAGS_MAX }, () => filled(tagLength)),
  })

  const directions = submissionSchema.shape.directions.unwrap().parse(
    Array.from({ length: MAX_LEGS }, () => ({
      from: filled(airportLength),
      to: filled(airportLength),
      date: '2026-09-15',
      returnDate: '2026-09-22',
      passengers,
    })),
  )

  const longest = (url: string) =>
    leadMessage({
      ...values,
      tags: values.tags ?? [],
      directions,
      locale: 'ru',
      source: '.'.repeat(64),
      page: { url },
    } as Lead)

  it('still fits in the one message Telegram accepts, escaping and all', () => {
    // `sendMessage` refuses anything over 4,096 characters, every attempt alike.
    expect(longest(`https://atmjet.com/ru?${'.'.repeat(2000)}`).length).toBeLessThanOrEqual(4096)
  })

  it('shortens the address rather than any of what the visitor wrote', () => {
    const message = longest(`https://atmjet.com/ru?${'.'.repeat(2000)}`)

    expect(message).toContain(filled(nameLength))
    expect(message).toContain('…')
    // A trimmed address never ends on the backslash half of an escape pair.
    expect(message).not.toMatch(/\\…/)
  })

  it('leaves an address that fits exactly as it is', () => {
    const message = longest('https://atmjet.com/ru')

    expect(message).toContain('🔗 From https://atmjet\\.com/ru')
    expect(message).not.toContain('…')
  })
})
