import type { Lead } from '@/payload-types'

/**
 * The Telegram side of a lead (issues #155 and #161, `docs/legacy-inventory.md` sections 7.4
 * and 9.1).
 *
 * The legacy site built this message in the browser component that submitted the form and sent
 * it from a server action that threw at module scope when either variable was missing. The
 * message is kept as it was, word for word and emoji for emoji, because it is what the people
 * reading the channel recognise; the two things that were wrong with it are not.
 */

/** The variables the dispatch needs; both are set per environment, neither is committed. */
export const TELEGRAM_VARIABLES = ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_IDS'] as const

export interface TelegramSettings {
  token: string
  /** Every chat the message goes to. The legacy variable was `ALLOWED_USERS` (section 9.1). */
  chatIds: string[]
}

/**
 * Reads the two variables, and names the ones that are missing rather than throwing (issue
 * #161). The legacy module threw as it was imported, so an environment without them broke every
 * page that led to a form rather than the one send that could not happen.
 */
export function readTelegramSettings(
  env: Record<string, string | undefined> = process.env,
): { ok: true; settings: TelegramSettings } | { ok: false; missing: string[] } {
  const token = env.TELEGRAM_BOT_TOKEN?.trim() ?? ''
  const chatIds = (env.TELEGRAM_CHAT_IDS ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)

  const missing = [
    ...(token === '' ? ['TELEGRAM_BOT_TOKEN'] : []),
    ...(chatIds.length === 0 ? ['TELEGRAM_CHAT_IDS'] : []),
  ]

  return missing.length > 0 ? { ok: false, missing } : { ok: true, settings: { token, chatIds } }
}

/** Every character MarkdownV2 reserves outside a code span, the backslash included. */
const RESERVED = /[\\_*[\]()~`>#+\-=|{}.!]/g

/** Inside a code span Telegram reads only these two, and a backslash before anything else shows. */
const RESERVED_IN_CODE = /[\\`]/g

/**
 * The legacy `mdEscape` left the backslash out, so a name carrying one was sent as malformed
 * MarkdownV2 and Telegram refused the whole message (section 13, entry 61). It also escaped the
 * phone number inside its code span, where the backslashes are drawn rather than read.
 */
const escape = (value: string): string => value.replace(RESERVED, '\\$&')

const code = (value: string): string => `\`${value.replace(RESERVED_IN_CODE, '\\$&')}\``

/** What the message needs of a lead; the rest of the document has no line in it. */
type LeadMessageFields = Pick<
  Lead,
  'name' | 'email' | 'phone' | 'tags' | 'directions' | 'locale' | 'source' | 'page'
>

/** A leg of the itinerary, in the order the legacy message drew its rows. */
const LEG_ROWS = [
  ['From', 'from'],
  ['To', 'to'],
  ['Date', 'date'],
  ['Return', 'returnDate'],
  ['Passengers', 'passengers'],
  ['Guests', 'guests'],
  ['Hours', 'hours'],
] as const

function itinerary(directions: LeadMessageFields['directions']): string {
  if (!directions || directions.length === 0) return '*No directions*'

  return directions
    .map((leg, index) => {
      const rows = LEG_ROWS.flatMap(([label, field]) => {
        const value = leg[field]

        // The legacy `add` drew a row only for a value that was there, and `0` counts as there.
        return value === null || value === undefined || value === ''
          ? []
          : [`*${label}:* ${escape(String(value))}`]
      })

      return [`*${index + 1}\\. Direction*`, ...rows].join('\n')
    })
    .join('\n\n')
}

/** What Telegram accepts in one `sendMessage`; anything longer is refused, every attempt. */
const MESSAGE_MAX_LENGTH = 4096

/**
 * The address the lead was submitted from, shortened to whatever room is left. Every other field
 * is bounded where it is submitted (`src/lib/leads.ts`), and the URL is the one part that can
 * still run long — it carries the itinerary as a query — so it is the part that yields. The
 * lead itself keeps the whole address either way.
 *
 * Trimmed before escaping, never after: escaping puts a backslash in front of a character, and
 * a cut between the two would end the message on a lone backslash. Escaping adds at most one
 * character per character, so half the room always fits.
 */
function fromLine(url: string, room: number): string {
  if (escape(url).length <= room) return `🔗 From ${escape(url)}`

  return `🔗 From ${escape(url.slice(0, Math.max(Math.floor(room / 2) - 1, 0)))}…`
}

/**
 * The message as `booking.tsx` built it (section 7.4, verbatim), from the stored lead rather
 * than from the form state that no longer exists by the time this runs.
 */
export function leadMessage(lead: LeadMessageFields): string {
  const tags = lead.tags ?? []

  const body = [
    '*🚀  New Booking Request*',
    '──────────────',
    `👤 *Name:* ${escape(lead.name)}`,
    `🌐 *Locale:* ${escape(lead.locale ?? '')}`,
    `💼 *Component:* ${escape(lead.source ?? '')}`,
    '',
    // The legacy message stripped the spaces out of the number on its way here.
    `📞 *Phone:* ${code(lead.phone.replaceAll(' ', ''))}`,
    `✉️ *Email:* ${escape(lead.email)}`,
    '',
    tags.length > 0 ? `🏷️ *Tags:* ${escape(tags.join(', '))}` : '🏷️ *Tags:* None',
    '',
    itinerary(lead.directions),
    // The blank line the legacy message left between the itinerary and the address.
    '',
    '',
  ].join('\n')

  return `${body}${fromLine(lead.page?.url ?? '', MESSAGE_MAX_LENGTH - body.length - '🔗 From '.length)}`
}
