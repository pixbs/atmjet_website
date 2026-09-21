import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { listEmptyLegs } from '@/lib/data/empty-legs'

import { createEmptyLeg, createUser, emptyLegData } from '../factories'
import { createRegistry, uniqueSuffix, type TestRegistry } from '../helpers/payload'

const revalidateTag = vi.hoisted(() => vi.fn())
const revalidatePath = vi.hoisted(() => vi.fn())
vi.mock('next/cache', () => ({ revalidatePath, revalidateTag }))

/**
 * Empty legs (issue #66). The legacy section read the table with `select *`, no ordering and no
 * filter, then resolved each route end with a wildcard `ILIKE` and dropped the row when that
 * missed (`docs/legacy-inventory.md` section 6). What is pinned here is the shape that replaces
 * all three, and the fact that a leg whose airport is unknown survives.
 */
let registry: TestRegistry

beforeAll(async () => {
  registry = await createRegistry()
})

afterAll(() => registry.cleanup())

const airport = (city: string) =>
  registry.create('airports', {
    icao: `UU${uniqueSuffix().slice(-2).toUpperCase()}`,
    city,
    country: 'Russia',
  })

describe('the route', () => {
  it('relates to airports and keeps the codes it was entered with', async () => {
    const from = await airport('Moscow')
    const to = await airport('Nice')

    const created = await createEmptyLeg(registry, {
      departureAirport: from.id,
      arrivalAirport: to.id,
      departureIcao: from.icao,
      arrivalIcao: to.icao,
    })

    const populated = await registry.payload.findByID({
      collection: 'empty-legs',
      id: created.id,
      depth: 1,
    })

    expect((populated.departureAirport as { city?: string }).city).toBe('Moscow')
    expect((populated.arrivalAirport as { city?: string }).city).toBe('Nice')
    expect(populated.departureIcao).toBe(from.icao)
  })

  it('survives a code that matches no airport, which the legacy section dropped', async () => {
    const created = await createEmptyLeg(registry, {
      departureIcao: 'ZZZZ',
      arrivalIcao: 'YYYY',
      departureAirport: null,
      arrivalAirport: null,
    })

    expect(created.departureIcao).toBe('ZZZZ')
    expect(created.arrivalIcao).toBe('YYYY')
  })

  it('stores the codes upper-cased and stripped, so a later airport still matches', async () => {
    const created = await createEmptyLeg(registry, {
      departureIcao: ' uu ww ',
      arrivalIcao: ' lfmn ',
    })

    expect(created.departureIcao).toBe('UUWW')
    expect(created.arrivalIcao).toBe('LFMN')
  })

  it('names the row by its route in the admin list', async () => {
    const created = await createEmptyLeg(registry, { departureIcao: 'UUWW', arrivalIcao: 'LFMN' })

    expect(created.route).toBe('UUWW → LFMN')
  })

  it('names a row whose codes are missing without pretending it has them', async () => {
    const created = await createEmptyLeg(registry, {
      departureIcao: undefined,
      arrivalIcao: undefined,
    })

    expect(created.route).toBe('???? → ????')
  })
})

describe('the departure', () => {
  it('is stored as the instant it is, whatever offset it was entered in', async () => {
    const created = await createEmptyLeg(registry, { departureAt: '2025-03-05T12:30:00+03:00' })

    expect(new Date(created.departureAt).toISOString()).toBe('2025-03-05T09:30:00.000Z')
  })

  it('is required, because a leg with no date cannot be offered', async () => {
    await expect(
      registry.create('empty-legs', emptyLegData({ departureAt: undefined })),
    ).rejects.toThrow()
  })
})

describe('ordering', () => {
  it('sorts by the order column the legacy site ignored, then by the departure', async () => {
    const marker = `ORD${uniqueSuffix().slice(-4).toUpperCase()}`
    const legs = [
      { order: 2, departureAt: '2025-01-01T00:00:00.000Z' },
      { order: null, departureAt: '2024-01-01T00:00:00.000Z' },
      { order: 1, departureAt: '2025-06-01T00:00:00.000Z' },
      { order: 1, departureAt: '2025-02-01T00:00:00.000Z' },
    ]

    for (const leg of legs) {
      await createEmptyLeg(registry, { ...leg, legacyAttributes: { marker } })
    }

    const found = await registry.payload.find({
      collection: 'empty-legs',
      where: { 'legacyAttributes.marker': { equals: marker } },
      sort: ['order', 'departureAt'],
      overrideAccess: true,
      limit: 0,
    })

    const departures = found.docs.map((doc) => new Date(doc.departureAt).toISOString())

    // By order, then by departure; a leg without an order comes last.
    expect(departures).toEqual([
      '2025-02-01T00:00:00.000Z',
      '2025-06-01T00:00:00.000Z',
      '2025-01-01T00:00:00.000Z',
      '2024-01-01T00:00:00.000Z',
    ])
  })

  it('is what the admin list opens on', async () => {
    const config = await registry.payload.config
    const collection = config.collections.find((entry) => entry.slug === 'empty-legs')

    expect(collection?.defaultSort).toEqual(['order', 'departureAt'])
  })
})

describe('the aircraft and the price', () => {
  it('keeps the legacy free text alongside a relationship to the catalogue', async () => {
    const jet = await registry.create('aircraft', {
      registrationDisplay: `RA-${uniqueSuffix().slice(-6)}`,
      provenance: { origin: 'manual' },
    })

    const created = await createEmptyLeg(registry, {
      aircraft: {
        document: jet.id,
        type: 'Challenger 650',
        category: 'Heavy jet',
        company: 'An operator',
        safety: 'ARGUS Platinum',
      },
    })

    expect(created.aircraft?.type).toBe('Challenger 650')
    expect(created.aircraft?.safety).toBe('ARGUS Platinum')
    // Payload returns a create populated, so this is the document rather than the id.
    expect((created.aircraft?.document as { id: number }).id).toBe(jet.id)
  })

  it('defaults to the dollars the legacy card hard-coded', async () => {
    const created = await createEmptyLeg(registry)

    expect(created.currency).toBe('USD')
    expect(created.price).toBe(18_500)
  })

  it('refuses a negative price or a negative seat count', async () => {
    await expect(registry.create('empty-legs', emptyLegData({ price: -1 }))).rejects.toThrow()
    await expect(registry.create('empty-legs', emptyLegData({ seats: -1 }))).rejects.toThrow()
  })
})

describe('provenance', () => {
  it('records where a leg came from and keeps the rest verbatim', async () => {
    const legacyAttributes = { atmjet_admin__empty_legs: { end: '2025-03-05T14:00:00.000Z' } }

    const created = await createEmptyLeg(registry, {
      legacyAttributes,
      provenance: { origin: 'empty-legs-legacy', legacyId: 41, importRunId: 'run-1' },
    })

    expect(created.legacyAttributes).toEqual(legacyAttributes)
    expect(created.provenance?.origin).toBe('empty-legs-legacy')
  })
})

describe('access', () => {
  it('is live for a visitor the moment it is saved, as the legacy catalogue was', async () => {
    // No draft state on the catalogue (issue #236): an editor saves and the listing is public.
    const saved = await createEmptyLeg(registry)

    const asVisitor = await registry.payload.find({
      collection: 'empty-legs',
      where: { id: { equals: saved.id } },
      overrideAccess: false,
    })

    expect(asVisitor.totalDocs).toBe(1)
  })

  it('is not writable anonymously and is writable by an editor', async () => {
    await expect(
      registry.payload.create({
        collection: 'empty-legs',
        data: emptyLegData(),
        overrideAccess: false,
      }),
    ).rejects.toThrow()

    const editor = await createUser(registry)
    const created = await registry.payload.create({
      collection: 'empty-legs',
      data: emptyLegData(),
      overrideAccess: false,
      user: editor,
    })
    registry.track('empty-legs', created.id)

    expect(created.id).toBeDefined()
  })
})

describe('revalidation', () => {
  it('drops the cached pages when a leg is saved', async () => {
    revalidateTag.mockClear()
    await createEmptyLeg(registry)

    const tags = revalidateTag.mock.calls.map(([tag]) => tag as string)

    expect(tags).toContain('empty-legs')
  })
})

/**
 * The list the section on a page reads (issue #117). The legacy section read the whole table in
 * whatever order the database felt like, looked each code up with a wildcard `ILIKE`, and dropped
 * a leg it could not resolve (`docs/legacy-inventory.md` section 6).
 */
describe('the listing the section reads', () => {
  /** The suite's own Payload, as the section's data helper would be given one on the server. */
  const client = () => Promise.resolve(registry.payload)

  /** An airport in both languages, as the import of E5.5 leaves them. */
  async function airportIn(icao: string, en: [string, string], ru: [string, string]) {
    const created = await registry.create('airports', {
      icao,
      city: en[0],
      country: en[1],
    })

    await registry.payload.update({
      collection: 'airports',
      id: created.id,
      locale: 'ru',
      data: { city: ru[0], country: ru[1] },
      overrideAccess: true,
    })

    return created
  }

  it('lists the flights in the order an editor put them, whatever their dates', async () => {
    const [second, last, first] = await Promise.all([
      createEmptyLeg(registry, { order: 92, departureAt: '2026-01-01T00:00:00.000Z' }),
      createEmptyLeg(registry, { order: null, departureAt: '2020-01-01T00:00:00.000Z' }),
      createEmptyLeg(registry, { order: 91, departureAt: '2026-06-01T00:00:00.000Z' }),
    ])
    const ids = [first.id, second.id, last.id]

    const listed = await listEmptyLegs('en', 500, client)

    expect(listed.filter((leg) => ids.includes(leg.id as number)).map((leg) => leg.id)).toEqual(ids)
  })

  it('lists a flight that has already left, as the legacy page did', async () => {
    // The decision on issue #117: no expiry rule, because the legacy site had none.
    const flown = await createEmptyLeg(registry, { departureAt: '2020-03-05T09:30:00.000Z' })

    const listed = await listEmptyLegs('en', 500, client)

    expect(listed.some((leg) => leg.id === flown.id)).toBe(true)
  })

  it('asks for no more flights than the section is set to show', async () => {
    await createEmptyLeg(registry)

    await expect(listEmptyLegs('en', 2, client)).resolves.toHaveLength(2)
  })

  it('names the airports in the language of the page', async () => {
    const from = await airportIn('UUEE', ['Moscow', 'Russia'], ['Москва', 'Россия'])
    const to = await airportIn('LFMD', ['Cannes', 'France'], ['Канны', 'Франция'])
    const leg = await createEmptyLeg(registry, {
      departureAirport: from.id,
      departureIcao: from.icao,
      arrivalAirport: to.id,
      arrivalIcao: to.icao,
    })

    const english = (await listEmptyLegs('en', 500, client)).find((one) => one.id === leg.id)
    const russian = (await listEmptyLegs('ru', 500, client)).find((one) => one.id === leg.id)

    expect(english?.from).toEqual({ icao: 'UUEE', airport: 'Moscow, Russia' })
    expect(russian?.from).toEqual({ icao: 'UUEE', airport: 'Москва, Россия' })
    expect(russian?.to.airport).toBe('Канны, Франция')
  })

  it('keeps a flight whose code matches no airport, where the legacy dropped it', async () => {
    const leg = await createEmptyLeg(registry, {
      departureIcao: 'ZZZZ',
      arrivalIcao: 'YYYY',
      departureAirport: null,
      arrivalAirport: null,
    })

    const listed = (await listEmptyLegs('en', 500, client)).find((one) => one.id === leg.id)

    expect(listed?.from).toEqual({ icao: 'ZZZZ', airport: undefined })
    expect(listed?.to).toEqual({ icao: 'YYYY', airport: undefined })
  })

  it('lists none rather than taking the page down when the database cannot be reached', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    // Every legacy query was wrapped in `.catch(() => [])`, so an outage drew an empty section.
    await expect(
      listEmptyLegs('en', 5, () => Promise.reject(new Error('connection refused'))),
    ).resolves.toEqual([])
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })
})
