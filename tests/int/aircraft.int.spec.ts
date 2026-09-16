import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import type { AircraftQuery } from '@/lib/aircraft'
import { listCatalogueAircraft, resolveAircraft, searchAircraft } from '@/lib/data/aircraft'
import { createMedia, createUser } from '../factories'
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

  it('keeps an aircraft listed while saying it cannot be chartered', async () => {
    // `availability` is the only state the catalogue has (issue #236): a visitor still sees the
    // aircraft, with the legacy commercial state that the listing renders.
    const created = await registry.create('aircraft', aircraft({ availability: 'unavailable' }))

    expect(created.availability).toBe('unavailable')
    expect(created).not.toHaveProperty('_status')
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
  it('is live for a visitor the moment it is saved, as the legacy catalogue was', async () => {
    // No draft state on the catalogue (issue #236): an editor saves and the listing is public.
    const saved = await registry.create('aircraft', aircraft())

    const asVisitor = await registry.payload.find({
      collection: 'aircraft',
      where: { id: { equals: saved.id } },
      overrideAccess: false,
    })

    expect(asVisitor.totalDocs).toBe(1)
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

/**
 * The listing the aircraft carousel reads (issue #142). The legacy page read the `vehicles`
 * table ordered by the year painted on the aircraft, newest first, and took fifteen
 * (`docs/legacy-inventory.md` section 4).
 */
describe('the listing the aircraft carousel reads', () => {
  const client = () => Promise.resolve(registry.payload)

  it('lists the newest aircraft first, and one with no year last', async () => {
    const undated = await registry.create('aircraft', aircraft())
    const older = await registry.create(
      'aircraft',
      aircraft({ specification: { yearOfProduction: 2011 } }),
    )
    const newer = await registry.create(
      'aircraft',
      aircraft({ specification: { yearOfProduction: 2021 } }),
    )

    const listed = await listCatalogueAircraft('en', 500, client)
    const mine = listed
      .map((one) => one.id)
      .filter((id) => [undated.id, older.id, newer.id].includes(id as number))

    expect(mine).toEqual([newer.id, older.id, undated.id])
  })

  it('leaves out an aircraft an editor has taken off the market', async () => {
    const grounded = await registry.create('aircraft', aircraft({ availability: 'unavailable' }))

    const listed = await listCatalogueAircraft('en', 500, client)

    expect(listed.map((one) => one.id)).not.toContain(grounded.id)
  })

  it('asks for no more aircraft than the section is set to show', async () => {
    await registry.create('aircraft', aircraft())

    await expect(listCatalogueAircraft('en', 1, client)).resolves.toHaveLength(1)
  })

  it('reads the model and the first photograph, and leaves an empty figure empty', async () => {
    const upload = await createMedia(registry)
    const created = await registry.create(
      'aircraft',
      aircraft({
        type: { model: 'Gulfstream G650ER' },
        specification: { passengers: 14 },
        images: [{ type: 'exterior', media: upload.id }],
      }),
    )

    const listed = await listCatalogueAircraft('en', 500, client)
    const mine = listed.find((one) => one.id === created.id)

    expect(mine?.model).toBe('Gulfstream G650ER')
    expect(mine?.passengers).toBe(14)
    expect(mine?.year ?? null).toBeNull()
    expect(mine?.image?.src).toContain(upload.filename)
  })
})

/**
 * The listing the aircraft page reads (issue #135, `docs/legacy-inventory.md` section 4). Three
 * of the legacy list's defects are fixed rather than reproduced (section 13, entries 23, 24 and
 * 26), and each of them is a thing a visitor could see: an order that did nothing, aircraft that
 * were never listed, and batches shorter than the fifteen they promised.
 */
describe('the listing the aircraft page reads', () => {
  const client = () => Promise.resolve(registry.payload)

  /** Everything, so a run can pick its own aircraft out of a catalogue every run adds to. */
  const asked = (overrides: Partial<AircraftQuery> = {}): AircraftQuery => ({
    page: 1,
    perPage: 500,
    sort: 'size',
    direction: 'asc',
    // This listing offers none; the yachts page is the one with filters (issue #139).
    filters: {},
    ...overrides,
  })

  /** An aircraft with a photograph, which is what the listing draws a card from. */
  async function listed(specification: Record<string, number>) {
    const upload = await createMedia(registry)

    return registry.create(
      'aircraft',
      aircraft({ specification, images: [{ type: 'exterior', media: upload.id }] }),
    )
  }

  const order = (found: { id: number | string }[], mine: (number | string)[]) =>
    found.map((one) => one.id).filter((id) => mine.includes(id))

  it('sorts by the passengers a card shows, which the legacy option never did', async () => {
    // The legacy select offered `passangers`, which matched nothing, so the list stayed in id
    // order however a visitor asked for it (section 13, entry 23).
    const few = await listed({ passengers: 4 })
    const some = await listed({ passengers: 9 })
    const many = await listed({ passengers: 20 })
    const mine = [few.id, some.id, many.id]

    const down = await searchAircraft(
      'en',
      asked({ sort: 'passengers', direction: 'desc' }),
      client,
    )
    const up = await searchAircraft('en', asked({ sort: 'passengers' }), client)

    expect(order(down.aircraft, mine)).toEqual([many.id, some.id, few.id])
    expect(order(up.aircraft, mine)).toEqual([few.id, some.id, many.id])
  })

  it('lists an aircraft nobody has measured, and puts it last either way round', async () => {
    // The legacy filter asked for between 0 and 400 passengers on every read, so an aircraft
    // whose seats nobody had counted was never listed at all (section 13, entry 24).
    const measured = await listed({ passengers: 12 })
    const unmeasured = await listed({})
    const mine = [measured.id, unmeasured.id]

    const down = await searchAircraft(
      'en',
      asked({ sort: 'passengers', direction: 'desc' }),
      client,
    )
    const up = await searchAircraft('en', asked({ sort: 'passengers' }), client)

    expect(order(down.aircraft, mine)).toEqual([measured.id, unmeasured.id])
    expect(order(up.aircraft, mine)).toEqual([measured.id, unmeasured.id])
  })

  it('leaves out an aircraft with no photograph before counting, not after', async () => {
    // The legacy card returned nothing when it had no cover, after the batch of fifteen had
    // been chosen, so the grid was short and the next batch skipped rows (section 13, entry 26).
    const bare = await registry.create('aircraft', aircraft({ specification: { passengers: 8 } }))

    const found = await searchAircraft('en', asked(), client)

    expect(found.aircraft.map((one) => one.id)).not.toContain(bare.id)
  })

  it('leaves out an aircraft an editor has taken off the market', async () => {
    const upload = await createMedia(registry)
    const grounded = await registry.create(
      'aircraft',
      aircraft({ availability: 'unavailable', images: [{ type: 'exterior', media: upload.id }] }),
    )

    const found = await searchAircraft('en', asked(), client)

    expect(found.aircraft.map((one) => one.id)).not.toContain(grounded.id)
  })

  it('hands back a batch and how many there are, so the page can offer more', async () => {
    await listed({ passengers: 5 })
    await listed({ passengers: 6 })

    const first = await searchAircraft('en', asked({ perPage: 1 }), client)
    const second = await searchAircraft('en', asked({ perPage: 1, page: 2 }), client)

    // A page is how far the listing has been read, so the second holds the first as well.
    expect(first.aircraft).toHaveLength(1)
    expect(second.aircraft).toHaveLength(2)
    expect(second.aircraft[0]?.id).toBe(first.aircraft[0]?.id)
    expect(first.total).toBeGreaterThan(first.aircraft.length)
  })

  it('reads what a card prints, and leads to the aircraft by its slug', async () => {
    const upload = await createMedia(registry)
    const created = await registry.create(
      'aircraft',
      aircraft({
        registrationDisplay: `T7-${uniqueSuffix().slice(-5)}`,
        type: { name: 'Gulfstream G650ER', category: 'Ultra long range' },
        specification: { cabinHeight: 1.95 },
        images: [{ type: 'exterior', media: upload.id }],
      }),
    )

    const found = await searchAircraft('en', asked(), client)
    const mine = found.aircraft.find((one) => one.id === created.id)

    expect(mine?.name).toBe('Gulfstream G650ER')
    expect(mine?.category).toBe('Ultra long range')
    expect(mine?.registration).toBe(created.registrationDisplay)
    expect(mine?.slug).toBe(created.slug)
    expect(mine?.image?.src).toContain(upload.filename)
  })
})

/**
 * The aircraft a detail page is asked for (issue #138, `docs/legacy-inventory.md` section 4).
 * The legacy page read the first two dash-separated parts of the slug as a registration and
 * looked that up case-insensitively, so a catalogue slug and a bare tail number both answered;
 * both still do, and neither needs a redirect entry to.
 */
describe('the aircraft a detail page is asked for', () => {
  const client = () => Promise.resolve(registry.payload)

  it('answers to the slug the listing card writes', async () => {
    const created = await registry.create(
      'aircraft',
      aircraft({ slug: `gulfstream-${uniqueSuffix()}` }),
    )

    const found = await resolveAircraft(created.slug ?? '', 'en', client)

    expect(found?.id).toBe(created.id)
  })

  /** Dash-free: a registration is `RA-73025`, one dash, which is the shape the rule reads. */
  const tail = () => uniqueSuffix().replace(/-/g, '').slice(-6).toUpperCase()

  it('answers to the registration, however it is written', async () => {
    const suffix = tail()
    const created = await registry.create(
      'aircraft',
      aircraft({ registrationDisplay: `T7-${suffix}` }),
    )

    // What the listing card writes for an aircraft the import has not given a slug yet, and
    // what the legacy sitemap advertised: the tail number on its own.
    await expect(resolveAircraft(`T7${suffix}`, 'en', client)).resolves.toMatchObject({
      id: created.id,
    })
    await expect(resolveAircraft(`T7-${suffix}`, 'en', client)).resolves.toMatchObject({
      id: created.id,
    })
  })

  it('reads the registration out of a slug that carries a model after it', async () => {
    const suffix = tail()
    const created = await registry.create(
      'aircraft',
      aircraft({ registrationDisplay: `RA-${suffix}`, slug: undefined }),
    )

    const found = await resolveAircraft(`RA-${suffix}-gulfstream-g650`, 'en', client)

    expect(found?.id).toBe(created.id)
  })

  it('answers with nothing for a slug no aircraft has, so the page can send them to the list', async () => {
    await expect(
      resolveAircraft(`nothing-${uniqueSuffix()}`, 'en', client),
    ).resolves.toBeUndefined()
  })

  it('answers with nothing rather than throwing when the database cannot be reached', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    await expect(
      resolveAircraft('anything', 'en', () => Promise.reject(new Error('connection refused'))),
    ).resolves.toBeUndefined()
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })
})
