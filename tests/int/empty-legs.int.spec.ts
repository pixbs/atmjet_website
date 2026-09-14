import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { createEmptyLeg, createUser, emptyLegData } from '../factories'
import { createRegistry, uniqueSuffix, type TestRegistry } from '../helpers/payload'

const revalidateTag = vi.hoisted(() => vi.fn())
vi.mock('next/cache', () => ({ revalidateTag }))

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
