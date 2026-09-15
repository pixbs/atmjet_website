import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import type { Lead, PayloadJob } from '@/payload-types'
import { createLead } from '../factories'
import { createRegistry, type TestRegistry } from '../helpers/payload'

/**
 * A lead on its way to Telegram (issues #155 and #161, `docs/legacy-inventory.md` sections 7.4
 * and 9.1).
 *
 * The legacy site sent the message from the browser and kept no record: a refusal was an
 * unhandled rejection and the lead was gone (section 13, entry 62). What is pinned here is that
 * the send is queued rather than awaited, that every outcome reaches the document, and that an
 * environment without the variables loses nothing.
 *
 * Every run is of one job by its id. Vitest gives each file its own worker against one database,
 * so draining the whole queue would run the jobs of a suite in another worker and rewrite the
 * leads it is looking at.
 */
let registry: TestRegistry
/** Jobs older than the suite belong to another run of it; the table is never emptied. */
let since: string

beforeAll(async () => {
  registry = await createRegistry()
  since = new Date().toISOString()
})

afterAll(() => registry.cleanup())

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

/** The queued sends for one lead, whether or not they have run. */
async function jobsFor(lead: Lead): Promise<PayloadJob[]> {
  const { docs } = await registry.payload.find({
    collection: 'payload-jobs',
    where: {
      and: [{ taskSlug: { equals: 'sendTelegramLead' } }, { createdAt: { greater_than: since } }],
    },
    limit: 100,
    sort: '-createdAt',
    overrideAccess: true,
  })

  const mine = docs.filter((job) => (job.input as { leadId?: number } | null)?.leadId === lead.id)
  for (const job of mine) registry.track('payload-jobs', job.id)

  return mine
}

/** Runs the one job this lead queued, as the cron does when it reaches it. */
async function deliver(lead: Lead): Promise<void> {
  const [job] = await jobsFor(lead)
  expect(job, 'the lead queued no send').toBeDefined()

  await registry.payload.jobs.runByID({ id: job.id, silent: true })
}

/** The telegram row of a lead, read back from the database rather than from the create result. */
async function telegramDelivery(lead: Lead) {
  const reread = await registry.payload.findByID({
    collection: 'leads',
    id: lead.id,
    depth: 0,
    overrideAccess: true,
  })

  return {
    status: reread.deliveryStatus,
    row: (reread.delivery ?? []).find((entry) => entry.channel === 'telegram'),
  }
}

/** A Telegram API that answers as the real one does, and remembers what it was asked. */
function telegramAnswers(answer: { ok: boolean; status?: number; body?: string }) {
  const calls: { url: string; body: Record<string, unknown> }[] = []

  vi.stubGlobal('fetch', (url: string, init: { body: string }) => {
    calls.push({ url, body: JSON.parse(init.body) as Record<string, unknown> })

    return Promise.resolve({
      ok: answer.ok,
      status: answer.status ?? (answer.ok ? 200 : 429),
      text: () => Promise.resolve(answer.body ?? ''),
    } as Response)
  })

  return calls
}

function configured(): void {
  vi.stubEnv('TELEGRAM_BOT_TOKEN', '123:abc')
  vi.stubEnv('TELEGRAM_CHAT_IDS', '-1001,-1002')
}

describe('queueing', () => {
  it('queues one send for a new lead, with the lead it is for', async () => {
    const lead = await createLead(registry)

    const jobs = await jobsFor(lead)
    expect(jobs).toHaveLength(1)
    expect((jobs[0].input as { leadId: number }).leadId).toBe(lead.id)
  })

  it('queues nothing more when the lead is edited afterwards', async () => {
    // The job writes its attempt back onto the lead, so a queue on update would send the lead
    // again every time somebody opened it in the admin.
    const lead = await createLead(registry)
    await registry.payload.update({
      collection: 'leads',
      id: lead.id,
      data: { userAgent: 'edited by hand' },
      overrideAccess: true,
    })

    expect(await jobsFor(lead)).toHaveLength(1)
  })
})

describe('when Telegram takes the message', () => {
  it('sends it to every chat and records the delivery on the lead', async () => {
    configured()
    const calls = telegramAnswers({ ok: true })
    const lead = await createLead(registry, { name: 'Sent', source: 'Header' })

    await deliver(lead)

    expect(calls.map((call) => call.body.chat_id)).toEqual(['-1001', '-1002'])
    expect(calls[0].url).toBe('https://api.telegram.org/bot123:abc/sendMessage')
    expect(calls[0].body.parse_mode).toBe('MarkdownV2')
    expect(calls[0].body.text).toContain('👤 *Name:* Sent')

    const { status, row } = await telegramDelivery(lead)
    expect(status).toBe('sent')
    expect(row?.status).toBe('sent')
    expect(row?.attempts).toBe(1)
    expect(row?.deliveredAt).toBeTruthy()
    expect(row?.lastError).toBeFalsy()
  })
})

describe('when Telegram refuses it', () => {
  it('records what it said, keeps the lead, and asks to be run again', async () => {
    configured()
    telegramAnswers({ ok: false, status: 429, body: 'Too Many Requests: retry after 30' })
    const lead = await createLead(registry)

    // The task throws, which is what asks Payload for the retry; the lead is written first.
    await expect(deliver(lead)).resolves.toBeUndefined()

    const { status, row } = await telegramDelivery(lead)
    expect(status).toBe('failed')
    expect(row?.status).toBe('failed')
    expect(row?.attempts).toBe(1)
    expect(row?.lastError).toContain('429')
    expect(row?.lastError).toContain('-1001')
    expect(row?.lastError).toContain('-1002')

    // The job is still there, which is what a retry runs; a send that cannot work leaves none.
    expect(await jobsFor(lead)).toHaveLength(1)
  })

  it('counts the attempts, so a lead that keeps failing says how often it has been tried', async () => {
    configured()
    telegramAnswers({ ok: false, status: 500 })
    const lead = await createLead(registry)

    await deliver(lead)
    const [job] = await jobsFor(lead)
    await registry.payload.jobs.runByID({ id: job.id, silent: true })

    expect((await telegramDelivery(lead)).row?.attempts).toBe(2)
  })
})

describe('when the variables are missing', () => {
  it('keeps the lead and records why it could not be sent, rather than throwing (issue #161)', async () => {
    vi.stubEnv('TELEGRAM_BOT_TOKEN', '')
    vi.stubEnv('TELEGRAM_CHAT_IDS', '')
    const calls = telegramAnswers({ ok: true })
    const lead = await createLead(registry, { name: 'Unconfigured' })

    await deliver(lead)

    expect(calls).toHaveLength(0)

    const { status, row } = await telegramDelivery(lead)
    expect(status).toBe('failed')
    expect(row?.lastError).toContain('TELEGRAM_BOT_TOKEN')
    expect(row?.lastError).toContain('TELEGRAM_CHAT_IDS')

    // Nothing to try again until somebody sets them, so the job is done rather than retrying.
    expect(await jobsFor(lead)).toHaveLength(0)
  })
})
