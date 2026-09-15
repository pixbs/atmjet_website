import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { createRegistry, uniqueSuffix, type TestRegistry } from '../helpers/payload'

// The action reads the request's own headers, which a suite has not got; this is what a browser
// would have sent. Hoisted, because the module under test imports them as it loads.
const requestHeaders = vi.hoisted(
  () =>
    new Headers({
      referer: 'https://atmjet.com/en/empty_legs',
      'user-agent': 'Mozilla/5.0 (a visitor)',
    }),
)
vi.mock('next/headers', () => ({ headers: () => Promise.resolve(requestHeaders) }))

const { submitLead } = await import('@/lib/data/leads')

/**
 * Writing a lead down (issues #152 and #154, `docs/legacy-inventory.md` section 9.1).
 *
 * The legacy site stored nothing at all, so everything here is new: what the action keeps of a
 * submission, what it refuses, and that the lead reaches the queue that sends it (issue #155).
 */
let registry: TestRegistry

beforeAll(async () => {
  registry = await createRegistry()
})

afterAll(() => registry.cleanup())

const submission = (overrides: Record<string, unknown> = {}) => ({
  values: {
    name: `A visitor ${uniqueSuffix()}`.slice(0, 32),
    email: `visitor-${uniqueSuffix()}@example.test`,
    phone: '+971 (50) 458-99-26',
    tags: ['press'],
  },
  formType: 'booking-dialog' as const,
  source: 'Header',
  locale: 'en' as const,
  url: 'https://atmjet.com/en/empty_legs?utm_source=telegram&utm_campaign=empty-legs',
  // As long as a visitor who is not hurrying takes over the three fields (issue #157).
  elapsedMs: 30_000,
  ...overrides,
})

/** The lead the action wrote, found by the address it was submitted with. */
async function leadFor(email: string) {
  const { docs } = await registry.payload.find({
    collection: 'leads',
    where: { email: { equals: email } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const lead = docs[0]
  if (lead) registry.track('leads', lead.id)

  return lead
}

describe('a submission', () => {
  it('is written down with everything the legacy message carried in prose', async () => {
    const sent = submission()

    await expect(submitLead(sent)).resolves.toEqual({ ok: true })

    const lead = await leadFor(sent.values.email)
    expect(lead?.name).toBe(sent.values.name)
    expect(lead?.phone).toBe('+971 (50) 458-99-26')
    expect(lead?.tags).toEqual(['press'])
    expect(lead?.formType).toBe('booking-dialog')
    expect(lead?.source).toBe('Header')
    expect(lead?.locale).toBe('en')
    // The context the legacy message wrote out as a sentence, kept as fields instead.
    expect(lead?.page?.path).toBe('/en/empty_legs')
    expect(lead?.page?.referrer).toBe('https://atmjet.com/en/empty_legs')
    expect(lead?.utm?.source).toBe('telegram')
    expect(lead?.utm?.campaign).toBe('empty-legs')
    expect(lead?.userAgent).toContain('a visitor')
  })

  it('keeps the legs a flight request handed over', async () => {
    const sent = submission({
      formType: 'flight-request',
      directions: [
        { from: 'Dubai (OMDB)', to: 'London (EGLL)', date: '2026-10-01', passengers: 3 },
      ],
    })

    await expect(submitLead(sent)).resolves.toEqual({ ok: true })

    const lead = await leadFor(sent.values.email)
    expect(lead?.directions?.[0]).toMatchObject({ from: 'Dubai (OMDB)', passengers: 3 })
  })

  it('reaches the queue that sends it to Telegram', async () => {
    const sent = submission()
    await submitLead(sent)
    const lead = await leadFor(sent.values.email)

    const { docs } = await registry.payload.find({
      collection: 'payload-jobs',
      where: { taskSlug: { equals: 'sendTelegramLead' } },
      limit: 100,
      sort: '-createdAt',
      overrideAccess: true,
    })
    const queued = docs.filter(
      (job) => (job.input as { leadId?: number } | null)?.leadId === lead?.id,
    )
    for (const job of queued) registry.track('payload-jobs', job.id)

    expect(queued).toHaveLength(1)
    // Nothing has run yet, so the lead says so rather than saying nothing.
    expect(lead?.deliveryStatus).toBe('pending')
  })

  it('is refused, and writes nothing, when it says something the site does not have', async () => {
    const sent = submission({ locale: 'fr' })

    await expect(submitLead(sent as never)).resolves.toEqual({ ok: false })
    expect(await leadFor(sent.values.email)).toBeUndefined()
  })

  it('is refused when a field is one the legacy form would have refused', async () => {
    const sent = submission()

    await expect(
      submitLead({ ...sent, values: { ...sent.values, phone: '+971 50' } }),
    ).resolves.toEqual({ ok: false })
    expect(await leadFor(sent.values.email)).toBeUndefined()
  })
})

/**
 * The invisible measures of issue #157, where they are actually applied: the one server action
 * every form goes through. A refusal writes nothing at all — not the lead, and not the address
 * it came from.
 */
describe('a submission that looks automated', () => {
  it('is refused when it filled in the field nothing shows', async () => {
    const sent = submission({ trap: 'ATM JET' })

    await expect(submitLead(sent)).resolves.toEqual({ ok: false })
    expect(await leadFor(sent.values.email)).toBeUndefined()
  })

  it('is refused when the form was sent the instant it was reached', async () => {
    const sent = submission({ elapsedMs: 0 })

    await expect(submitLead(sent)).resolves.toEqual({ ok: false })
    expect(await leadFor(sent.values.email)).toBeUndefined()
  })

  it('is refused when the time it claims is not a time at all', async () => {
    // A number outside the range becomes nought rather than a reason to trust it.
    const sent = submission({ elapsedMs: -5 })

    await expect(submitLead(sent as never)).resolves.toEqual({ ok: false })
    expect(await leadFor(sent.values.email)).toBeUndefined()
  })
})

/**
 * The limit per address (issue #157). The other suites here submit with no address at all, so
 * the window is untouched until this one writes one on the request.
 */
describe('a flood from one address', () => {
  const address = '203.0.113.42'

  beforeAll(() => {
    requestHeaders.set('x-forwarded-for', address)
  })

  afterAll(() => {
    requestHeaders.delete('x-forwarded-for')
  })

  it('lets an ordinary run of enquiries through and then stops', async () => {
    const accepted: boolean[] = []

    // Until it says no, from a run far longer than one visitor makes in an hour. The number is
    // not asserted: what matters is that a run gets through and a flood does not.
    for (let attempt = 0; attempt < 30 && (accepted.at(-1) ?? true); attempt += 1) {
      accepted.push((await submitLead(submission())).ok)
    }

    expect(accepted[0]).toBe(true)
    expect(accepted.at(-1)).toBe(false)
    // An address is shared by everyone behind one company network, so the door stays open for
    // longer than one enquiry.
    expect(accepted.filter(Boolean).length).toBeGreaterThanOrEqual(5)
  })
})
