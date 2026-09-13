import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { LEAD_NAME_MAX_LENGTH } from '@/lib/leads'
import { createAdmin, createLead, createUser, leadData } from '../factories'
import { createRegistry, type TestRegistry } from '../helpers/payload'

/**
 * Leads (issue #68). The legacy site stored none of these, so everything here is new; what is
 * pinned is that the form rules it did have are reproduced (`docs/legacy-inventory.md` sections
 * 7.1 and 7.2), that the collection is closed to the public API while the Local API the server
 * action uses still works, and that delivery is visible.
 */
let registry: TestRegistry

beforeAll(async () => {
  registry = await createRegistry()
})

afterAll(() => registry.cleanup())

/** The field errors a refused write carries; Payload's summary only names the invalid field. */
async function refusal(run: () => Promise<unknown>): Promise<{ path: string; message: string }[]> {
  const thrown = await run().then(
    () => undefined,
    (error: unknown) => error,
  )

  expect(thrown).toBeInstanceOf(Error)

  const { data } = thrown as { data?: { errors?: { path: string; message: string }[] } }
  return data?.errors ?? []
}

describe('how a lead is created', () => {
  it('can be created through the Local API, which the server action uses', async () => {
    // `registry.create` is `payload.create` with the default overrideAccess, exactly what a
    // server action does: no session, no REST, no access check.
    const created = await createLead(registry)

    expect(created.id).toBeDefined()
    expect(created.name).toBe('A visitor')
  })

  it('cannot be created by anything that goes through access control', async () => {
    // `overrideAccess: false` is what a REST or GraphQL request is: this is the public API.
    await expect(
      registry.payload.create({ collection: 'leads', data: leadData(), overrideAccess: false }),
    ).rejects.toThrow()

    const editor = await createUser(registry)
    await expect(
      registry.payload.create({
        collection: 'leads',
        data: leadData(),
        overrideAccess: false,
        user: editor,
      }),
    ).rejects.toThrow()
  })

  it('can be created by an admin through the API, so the admin panel works', async () => {
    const owner = await createAdmin(registry)

    const created = await registry.payload.create({
      collection: 'leads',
      data: leadData(),
      overrideAccess: false,
      user: owner,
    })
    registry.track('leads', created.id)

    expect(created.id).toBeDefined()
  })
})

describe('access', () => {
  it('is not readable anonymously or by an editor', async () => {
    const editor = await createUser(registry)
    await createLead(registry)

    await expect(
      registry.payload.find({ collection: 'leads', overrideAccess: false }),
    ).rejects.toThrow()

    await expect(
      registry.payload.find({ collection: 'leads', overrideAccess: false, user: editor }),
    ).rejects.toThrow()
  })

  it('is readable by an admin', async () => {
    const owner = await createAdmin(registry)
    const lead = await createLead(registry)

    const found = await registry.payload.findByID({
      collection: 'leads',
      id: lead.id,
      overrideAccess: false,
      user: owner,
    })

    expect(found.email).toBe(lead.email)
  })

  it("stays out of an editor's sidebar, because they cannot open it", async () => {
    const config = await registry.payload.config
    const leads = config.collections.find((collection) => collection.slug === 'leads')
    const hidden = leads?.admin.hidden as (args: unknown) => boolean

    expect(typeof hidden).toBe('function')
    expect(hidden({ user: { id: 1, roles: ['editor'] } })).toBe(true)
    expect(hidden({ user: { id: 1, roles: ['admin'] } })).toBe(false)
  })
})

describe('the fields the form submitted', () => {
  it('keeps the itinerary in the order it was entered', async () => {
    const created = await createLead(registry, {
      formType: 'flight-request',
      source: 'Flight_request',
      directions: [
        { from: 'UUWW', to: 'LFMN', date: '2025-03-05', passengers: 4 },
        { from: 'LFMN', to: 'OMDB', date: '2025-03-09', passengers: 4 },
      ],
      tags: ['Partnership request', 'press'],
    })

    expect(created.directions?.map((leg) => leg.from)).toEqual(['UUWW', 'LFMN'])
    expect(created.tags).toEqual(['Partnership request', 'press'])
  })

  it('keeps the page, the campaign and the user agent the submission arrived with', async () => {
    const created = await createLead(registry, {
      page: {
        path: '/en/empty_legs',
        url: 'https://atmjet.com/en/empty_legs',
        referrer: 'https://www.google.com/',
      },
      utm: { source: 'google', medium: 'cpc', campaign: 'empty-legs-q1' },
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
    })

    expect(created.page?.path).toBe('/en/empty_legs')
    expect(created.utm?.campaign).toBe('empty-legs-q1')
    expect(created.userAgent).toContain('Mozilla')
  })

  it('refuses a phone number the legacy form would have refused', async () => {
    for (const phone of ['1234567', '1234567890123456']) {
      const errors = await refusal(() => registry.create('leads', leadData({ phone })))

      expect(errors.map((error) => error.path)).toEqual(['phone'])
      expect(errors[0].message).toMatch(/between 8 and 15 digits/i)
    }
  })

  it('accepts a phone number however it is punctuated, as the legacy form did', async () => {
    const created = await createLead(registry, { phone: '+7 (495) 000-00-00' })

    // Stored as submitted: the legacy message stripped the spaces on its way out, not on its way in.
    expect(created.phone).toBe('+7 (495) 000-00-00')
  })

  it('refuses something that is not an e-mail address', async () => {
    const errors = await refusal(() =>
      registry.create('leads', leadData({ email: 'someone@example' })),
    )

    expect(errors.map((error) => error.path)).toEqual(['email'])
  })

  it('refuses a name longer than the legacy form allowed', async () => {
    await expect(
      registry.create('leads', leadData({ name: 'x'.repeat(LEAD_NAME_MAX_LENGTH + 1) })),
    ).rejects.toThrow()
  })

  it('needs a name, an e-mail address, a phone number and a form', async () => {
    for (const field of ['name', 'email', 'phone', 'formType'] as const) {
      await expect(registry.create('leads', leadData({ [field]: undefined }))).rejects.toThrow()
    }
  })
})

describe('delivery', () => {
  it('starts pending, because nothing has been sent yet', async () => {
    const created = await createLead(registry)

    expect(created.deliveryStatus).toBe('pending')
  })

  it('turns failed when a channel refuses, and records what it said', async () => {
    const created = await createLead(registry, {
      delivery: [
        {
          channel: 'telegram',
          status: 'failed',
          attempts: 2,
          lastError: 'Failed to send to 123: 429 Too Many Requests',
        },
      ],
    })

    expect(created.deliveryStatus).toBe('failed')
    expect(created.delivery?.[0].lastError).toContain('429')
    expect(created.delivery?.[0].attempts).toBe(2)
  })

  it('turns sent once every channel has arrived, and back when one is added', async () => {
    const created = await createLead(registry, {
      delivery: [
        { channel: 'telegram', status: 'sent', attempts: 1 },
        { channel: 'crm', status: 'sent', attempts: 1 },
      ],
    })
    expect(created.deliveryStatus).toBe('sent')

    const reopened = await registry.payload.update({
      collection: 'leads',
      id: created.id,
      data: {
        delivery: [
          { channel: 'telegram', status: 'sent', attempts: 1 },
          { channel: 'crm', status: 'pending', attempts: 0 },
        ],
      },
      overrideAccess: true,
    })

    expect(reopened.deliveryStatus).toBe('pending')
  })

  it('needs a channel and a status on every attempt', async () => {
    await expect(
      registry.create('leads', leadData({ delivery: [{ attempts: 1 }] as never })),
    ).rejects.toThrow()
  })
})
