import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { createUser } from '../factories'
import { createRegistry, uniqueSuffix, type TestRegistry } from '../helpers/payload'

const revalidateTag = vi.hoisted(() => vi.fn())
vi.mock('next/cache', () => ({ revalidateTag }))

/**
 * The Aircraft catalogue (issue #63). It is the central schema of the site, so what is pinned
 * here is the contract E5.6, E5.7 and the pages of E8 all depend on: the natural key, the slug,
 * provenance, access and the rule that picks a detail layout.
 */
let registry: TestRegistry

beforeAll(async () => {
  registry = await createRegistry()
})

afterAll(() => registry.cleanup())

const aircraft = (overrides: Record<string, unknown> = {}) => ({
  registrationDisplay: `RA-${uniqueSuffix().slice(-6)}`,
  slug: `aircraft-${uniqueSuffix()}`,
  provenance: { origin: 'manual' as const },
  ...overrides,
})

describe('registration as the natural key', () => {
  it('derives the canonical form from what an editor types', async () => {
    const created = await registry.create('aircraft', aircraft({ registrationDisplay: 'RA-73025' }))

    expect(created.registrationDisplay).toBe('RA-73025')
    expect(created.registration).toBe('RA73025')
  })

  it('refuses a second aircraft with the same canonical registration', async () => {
    const suffix = uniqueSuffix().slice(-5)
    await registry.create('aircraft', aircraft({ registrationDisplay: `M-${suffix}` }))

    // Written differently, the same aircraft: the legacy merge compares exactly this way.
    await expect(
      registry.create('aircraft', aircraft({ registrationDisplay: `m ${suffix}` })),
    ).rejects.toThrow()
  })

  it('keeps the display spelling the detail page renders', async () => {
    const created = await registry.create('aircraft', aircraft({ registrationDisplay: 'OE-LAB' }))

    expect(created.registrationDisplay).toBe('OE-LAB')
  })

  it('follows the display value when it is edited', async () => {
    const created = await registry.create('aircraft', aircraft())

    const updated = await registry.payload.update({
      collection: 'aircraft',
      id: created.id,
      data: { registrationDisplay: `N-${uniqueSuffix().slice(-5)}` },
      overrideAccess: true,
    })

    expect(updated.registration).toBe(updated.registrationDisplay?.replace(/-/g, '').toUpperCase())
  })
})

describe('slugs', () => {
  it('refuses two aircraft with the same slug, so a URL resolves to one document', async () => {
    const slug = `duplicate-${uniqueSuffix()}`
    await registry.create('aircraft', aircraft({ slug }))

    await expect(registry.create('aircraft', aircraft({ slug }))).rejects.toThrow()
  })
})

describe('provenance', () => {
  it('records where a document came from and what was folded into it', async () => {
    const created = await registry.create(
      'aircraft',
      aircraft({
        provenance: {
          origin: 'aircrafts-catalog' as const,
          legacyAircraftId: 412,
          legacyVehicleId: 88,
          legacyTailNumber: 'RA-73025',
          legacySlug: 'gulfstream-g650-ra-73025',
          mergedFrom: [{ table: 'vehicles', id: 88 }],
          importRunId: 'run-2026-09-13',
        },
      }),
    )

    expect(created.provenance?.origin).toBe('aircrafts-catalog')
    expect(created.provenance?.legacyAircraftId).toBe(412)
    expect(created.provenance?.mergedFrom?.[0]).toMatchObject({ table: 'vehicles', id: 88 })
  })
})

describe('legacy columns with no field of their own', () => {
  it('keeps them verbatim, so nothing is lost before reconciliation', async () => {
    const legacyAttributes = {
      vehicles: { article: 'A-102', vendor: 3, made_in: 'USA', tags: 'vip,long-range' },
      aircrafts: { verified_at: '2024-06-01', airport_name: 'Vnukovo International' },
    }

    const created = await registry.create('aircraft', aircraft({ legacyAttributes }))

    expect(created.legacyAttributes).toEqual(legacyAttributes)
  })
})

describe('specification and offerings', () => {
  it('stores the numbers the listing sorts and filters on', async () => {
    const created = await registry.create(
      'aircraft',
      aircraft({
        specification: {
          passengers: 14,
          rangeMaximum: 12_960,
          cabinHeight: 1.88,
          yearOfProduction: 2019,
        },
      }),
    )

    expect(created.specification?.passengers).toBe(14)
    expect(created.specification?.rangeMaximum).toBe(12_960)
    expect(created.specification?.cabinHeight).toBeCloseTo(1.88)
  })

  it('carries the four legacy booleans as offerings', async () => {
    const created = await registry.create('aircraft', aircraft({ offerings: ['charter', 'sale'] }))

    expect(created.offerings).toEqual(['charter', 'sale'])
  })

  it('separates the aircraft from its publication state', async () => {
    // `availability` rather than `status`: drafts generate a `_status` enum of that name.
    const created = await registry.create('aircraft', aircraft({ availability: 'unavailable' }))

    expect(created.availability).toBe('unavailable')
    expect(created._status).toBe('draft')
  })
})

describe('images', () => {
  it('keeps the roles the legacy enum allowed, in an explicit order', async () => {
    const created = await registry.create(
      'aircraft',
      aircraft({
        images: [
          { type: 'exterior', externalUrl: 'https://example.test/a.jpg' },
          { type: 'cabin', externalUrl: 'https://example.test/b.jpg' },
        ],
      }),
    )

    expect(created.images?.map((image) => image.type)).toEqual(['exterior', 'cabin'])
  })
})

describe('base airport', () => {
  it('relates to an airport rather than repeating its columns', async () => {
    const airport = await registry.create('airports', {
      icao: `UU${uniqueSuffix().slice(-2).toUpperCase()}`,
      city: 'Moscow',
    })

    const created = await registry.create('aircraft', aircraft({ baseAirport: airport.id }))
    const withAirport = await registry.payload.findByID({
      collection: 'aircraft',
      id: created.id,
      depth: 1,
    })

    expect((withAirport.baseAirport as { id: number }).id).toBe(airport.id)
  })
})

describe('access', () => {
  it('hides a draft from the public and shows a published one', async () => {
    const draft = await registry.create('aircraft', aircraft())

    const asVisitor = await registry.payload.find({
      collection: 'aircraft',
      where: { id: { equals: draft.id } },
      overrideAccess: false,
    })
    expect(asVisitor.totalDocs).toBe(0)

    await registry.payload.update({
      collection: 'aircraft',
      id: draft.id,
      data: { _status: 'published' },
      overrideAccess: true,
    })

    const published = await registry.payload.find({
      collection: 'aircraft',
      where: { id: { equals: draft.id } },
      overrideAccess: false,
    })
    expect(published.totalDocs).toBe(1)
  })

  it('is not writable anonymously and is writable by an editor', async () => {
    await expect(
      registry.payload.create({
        collection: 'aircraft',
        data: aircraft(),
        overrideAccess: false,
      }),
    ).rejects.toThrow()

    const editor = await createUser(registry)
    const created = await registry.payload.create({
      collection: 'aircraft',
      data: aircraft(),
      overrideAccess: false,
      user: editor,
    })
    registry.track('aircraft', created.id)

    expect(created.id).toBeDefined()
  })
})

describe('revalidation', () => {
  it('drops the cached pages when an aircraft is saved', async () => {
    revalidateTag.mockClear()
    await registry.create('aircraft', aircraft())

    const tags = revalidateTag.mock.calls.map(([tag]) => tag as string)

    expect(tags).toContain('aircraft')
  })
})
