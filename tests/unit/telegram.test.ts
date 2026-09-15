import { describe, expect, it } from 'vitest'

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
