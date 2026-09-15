import type { Payload, TaskConfig } from 'payload'

import type { Lead } from '@/payload-types'
import { leadMessage, readTelegramSettings, TELEGRAM_VARIABLES } from '@/lib/telegram'

/**
 * The lead on its way to Telegram (issues #155 and #161, `docs/legacy-inventory.md` sections 7.4
 * and 9.1).
 *
 * The legacy site sent the message from the browser's submit handler: one chat at a time,
 * stopping at the first refusal, with no retry and nowhere for the failure to be recorded, so a
 * lead Telegram would not take was simply lost (section 13, entry 62). Here the lead is stored
 * first and the send is a job, so a refusal is retried with a backoff and, whatever happens,
 * ends up on the document as an attempt an administrator can read.
 */
const ENDPOINT = 'https://api.telegram.org'

/** Long enough for a slow answer, short enough that a hung connection is not the whole run. */
const SEND_TIMEOUT = 10_000

/** The channel this task delivers; a lead's other channels record themselves the same way. */
const CHANNEL = 'telegram'

type Delivery = NonNullable<Lead['delivery']>

/**
 * Writes the attempt onto the lead, keeping the row where it was and every other channel's row
 * as it is. The update is an update, so the hook that queues this job does not queue another.
 */
async function record(
  payload: Payload,
  lead: Lead,
  outcome: { status: 'failed' | 'sent'; error?: string },
): Promise<void> {
  const rows: Delivery = lead.delivery ?? []
  const previous = rows.find((row) => row.channel === CHANNEL)
  const now = new Date().toISOString()

  const attempt: Delivery[number] = {
    ...previous,
    channel: CHANNEL,
    status: outcome.status,
    attempts: (previous?.attempts ?? 0) + 1,
    lastAttemptAt: now,
    deliveredAt: outcome.status === 'sent' ? now : (previous?.deliveredAt ?? null),
    lastError: outcome.error ?? null,
  }

  await payload.update({
    collection: 'leads',
    id: lead.id,
    data: {
      delivery: previous
        ? rows.map((row) => (row.channel === CHANNEL ? attempt : row))
        : [...rows, attempt],
    },
    overrideAccess: true,
  })
}

/** One `sendMessage` call, in the shape the legacy bot posted it. */
async function send(token: string, chatId: string, text: string): Promise<void> {
  const response = await fetch(`${ENDPOINT}/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'MarkdownV2' }),
    signal: AbortSignal.timeout(SEND_TIMEOUT),
  })

  if (!response.ok) throw new Error(`${chatId}: ${response.status} ${await response.text()}`)
}

export const sendTelegramLead: TaskConfig<'sendTelegramLead'> = {
  slug: 'sendTelegramLead',
  label: 'Send a lead to Telegram',
  inputSchema: [{ name: 'leadId', type: 'number', required: true }],
  outputSchema: [{ name: 'delivered', type: 'number' }],
  // Telegram rate-limits a bot rather than refusing it for good, so a refusal is worth trying
  // again: three times, backing off, which is three more than the legacy site managed.
  retries: { attempts: 3, backoff: { type: 'exponential', delay: 5_000 } },
  handler: async ({ input, req }) => {
    const { payload } = req
    const lead = await payload.findByID({
      collection: 'leads',
      id: input.leadId,
      depth: 0,
      overrideAccess: true,
    })

    const configured = readTelegramSettings()

    // Nothing to try again until somebody sets the variables, so this failure is recorded and
    // the job ends rather than burning its retries on an environment that cannot send (#161).
    if (!configured.ok) {
      await record(payload, lead, {
        status: 'failed',
        error: `Telegram is not configured: ${configured.missing.join(' and ')} not set. The lead is kept; set ${TELEGRAM_VARIABLES.length === configured.missing.length ? 'them' : 'it'} and run this job again from the admin.`,
      })

      return { output: { delivered: 0 } }
    }

    const { token, chatIds } = configured.settings
    const text = leadMessage(lead)
    const failures: string[] = []
    let delivered = 0

    // Every chat is tried, where the legacy bot stopped at the first refusal and left the rest
    // of the desk without the lead.
    for (const chatId of chatIds) {
      try {
        await send(token, chatId, text)
        delivered += 1
      } catch (error) {
        failures.push(error instanceof Error ? error.message : String(error))
      }
    }

    await record(payload, lead, {
      status: failures.length === 0 ? 'sent' : 'failed',
      error: failures.length === 0 ? undefined : failures.join('\n'),
    })

    // Thrown rather than reported, which is what asks Payload for the retry; a chat that has
    // already had the message may see it twice, which beats a lead nobody sees at all.
    if (failures.length > 0)
      throw new Error(
        `Telegram refused ${failures.length} of ${chatIds.length}: ${failures.join('; ')}`,
      )

    return { output: { delivered } }
  },
}
