import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { listSaleYachts } from '@/lib/data/yachts'
import { slugify } from '@/lib/slug'
import {
  createAdmin,
  createContact,
  createMedia,
  createUser,
  createYacht,
  yachtData,
} from '../factories'
import { createRegistry, uniqueSuffix, type TestRegistry } from '../helpers/payload'

const revalidateTag = vi.hoisted(() => vi.fn())
vi.mock('next/cache', () => ({ revalidateTag }))

/**
 * Yachts (issue #65). One collection over two legacy tables, so what is pinned here is that each
 * listing type keeps its own columns and refuses the other's, that the slug rule fixes the three
 * things the legacy admin got wrong (`docs/legacy-inventory.md` section 14 item 4), and that a
 * contact never leaves the building.
 */
let registry: TestRegistry

beforeAll(async () => {
  registry = await createRegistry()
})

afterAll(() => registry.cleanup())

/**
 * The field errors a refused write carries. Payload's summary message only names the invalid
 * field ("The following field is invalid: sale"); the sentence an editor reads is in `data`.
 */
async function refusal(run: () => Promise<unknown>): Promise<{ path: string; message: string }[]> {
  const thrown = await run().then(
    () => undefined,
    (error: unknown) => error,
  )

  expect(thrown).toBeInstanceOf(Error)

  const { data } = thrown as { data?: { errors?: { path: string; message: string }[] } }
  return data?.errors ?? []
}

describe('slugs', () => {
  it('gives a Cyrillic name a stable ASCII slug instead of the legacy empty one', async () => {
    const name = `Жемчужина ${uniqueSuffix()}`
    const created = await createYacht(registry, { name })

    expect(created.slug).toBe(slugify(name))
    expect(created.slug).toMatch(/^zhemchuzhina_/)
  })

  it('keeps the slug an imported row arrived with', async () => {
    const created = await createYacht(registry, {
      name: 'Something Else Entirely',
      slug: `legacy_slug_${uniqueSuffix()}`,
      provenance: { origin: 'new-yachts-charter', legacySlug: 'legacy_slug' },
    })

    expect(created.slug).toMatch(/^legacy_slug_/)
  })

  it('does not move when the yacht is renamed, so a published URL stays put', async () => {
    const created = await createYacht(registry, { name: `Blue Ice ${uniqueSuffix()}` })

    const renamed = await registry.payload.update({
      collection: 'yachts',
      id: created.id,
      data: { name: 'Completely Different' },
      overrideAccess: true,
    })

    expect(renamed.slug).toBe(created.slug)
  })

  it('refuses a second yacht on the same slug, so a URL resolves to one listing', async () => {
    const slug = `duplicate_${uniqueSuffix()}`
    await createYacht(registry, { slug })

    await expect(createYacht(registry, { slug })).rejects.toThrow()
  })

  it('asks for a slug when the name is in a script it cannot transliterate', async () => {
    const errors = await refusal(() => registry.create('yachts', yachtData({ name: '海' })))

    expect(errors.map((error) => error.path)).toEqual(['slug'])
    expect(errors[0].message).toMatch(/URL of its detail page/)
  })

  it('refuses an update that blanks the slug of a published listing', async () => {
    const created = await createYacht(registry)

    const errors = await refusal(() =>
      registry.payload.update({
        collection: 'yachts',
        id: created.id,
        data: { slug: '' },
        overrideAccess: true,
      }),
    )

    expect(errors.map((error) => error.path)).toEqual(['slug'])
  })

  it('leaves a write that does not mention the name alone', async () => {
    const created = await createYacht(registry)

    const updated = await registry.payload.update({
      collection: 'yachts',
      id: created.id,
      data: { location: 'Monaco' },
      overrideAccess: true,
    })

    expect(updated.slug).toBe(created.slug)
    expect(updated.location).toBe('Monaco')
  })
})

describe('the charter listing', () => {
  it('keeps the columns of the legacy new_yachts table, cabins and bathrooms as text', async () => {
    const created = await createYacht(registry, {
      listingType: 'charter',
      location: 'Monaco',
      length: 128.5,
      charter: {
        manufacturer: 'Sunseeker',
        owner: 'A company',
        customerPrice: 1200,
        businessPrice: 900,
        currency: 'EUR',
        minHours: 4,
        guestsDay: 12,
        guestsNight: 8,
        cabins: '3+1',
        bathrooms: '2 / 2',
        refit: 2019,
      },
    })

    expect(created.charter?.cabins).toBe('3+1')
    expect(created.charter?.bathrooms).toBe('2 / 2')
    expect(created.charter?.customerPrice).toBe(1200)
    expect(created.charter?.currency).toBe('EUR')
    expect(created.length).toBeCloseTo(128.5)
  })

  it('refuses a price with no currency, and a currency with no price', async () => {
    expect(
      await refusal(() =>
        registry.create('yachts', yachtData({ charter: { customerPrice: 1200 } })),
      ),
    ).toEqual([
      {
        path: 'charter.currency',
        message: 'A price needs a currency: the listing card renders the two together.',
      },
    ])

    expect(
      await refusal(() => registry.create('yachts', yachtData({ charter: { currency: 'EUR' } }))),
    ).toEqual([
      {
        path: 'charter.customerPrice',
        message: 'A currency needs a price: the listing card renders the two together.',
      },
    ])
  })

  it('refuses the sale table columns', async () => {
    const errors = await refusal(() =>
      registry.create(
        'yachts',
        yachtData({ listingType: 'charter', sale: { shipyard: 'Benetti' } }),
      ),
    )

    expect(errors).toEqual([
      { path: 'sale', message: 'A charter listing cannot carry sale fields: shipyard.' },
    ])
  })
})

describe('the sale listing', () => {
  it('keeps the columns of the legacy yachts table, cabins as an integer', async () => {
    const created = await createYacht(registry, {
      listingType: 'sale',
      location: 'Antibes',
      sale: {
        shipyard: 'Benetti',
        year: 2016,
        beam: 27.5,
        draft: 8,
        cabins: 5,
        guests: 10,
        crew: 9,
        cruisingSpeed: 12,
        maxSpeed: 15,
      },
    })

    expect(created.sale?.cabins).toBe(5)
    expect(created.sale?.shipyard).toBe('Benetti')
    expect(created.sale?.maxSpeed).toBe(15)
  })

  it('refuses the charter table columns, so a flipped switch cannot keep an hourly price', async () => {
    const errors = await refusal(() =>
      registry.create(
        'yachts',
        yachtData({ listingType: 'sale', charter: { customerPrice: 1200, currency: 'EUR' } }),
      ),
    )

    expect(errors).toEqual([
      {
        path: 'charter',
        message: 'A sale listing cannot carry charter fields: currency, customerPrice.',
      },
    ])
  })

  it('refuses a price with no currency here as well', async () => {
    const errors = await refusal(() =>
      registry.create('yachts', yachtData({ listingType: 'sale', sale: { price: 4_500_000 } })),
    )

    expect(errors).toEqual([
      {
        path: 'sale.currency',
        message: 'A price needs a currency: the listing card renders the two together.',
      },
    ])
  })
})

describe('photos', () => {
  it('keeps the order they were entered in, which was the order of the legacy array', async () => {
    const created = await createYacht(registry, {
      photos: [
        { externalUrl: 'https://example.test/1.jpg' },
        { externalUrl: 'https://example.test/2.jpg' },
        { externalUrl: 'https://example.test/3.jpg' },
      ],
    })

    expect(created.photos?.map((photo) => photo.externalUrl)).toEqual([
      'https://example.test/1.jpg',
      'https://example.test/2.jpg',
      'https://example.test/3.jpg',
    ])
  })
})

describe('the people', () => {
  it('relates to a contact and a captain, and hides both from everyone but an admin', async () => {
    const owner = await createAdmin(registry)
    const contact = await createContact(registry)
    const captain = await createContact(registry)

    const created = await createYacht(registry, { contact: contact.id, captain: captain.id })

    const asAdmin = await registry.payload.findByID({
      collection: 'yachts',
      id: created.id,
      depth: 1,
      overrideAccess: false,
      user: owner,
    })
    expect((asAdmin.contact as { id: number }).id).toBe(contact.id)
    expect((asAdmin.captain as { id: number }).id).toBe(captain.id)

    // The acceptance criterion of issue #67: an anonymous request carries neither the document
    // nor the id that would find it.
    const asVisitor = await registry.payload.findByID({
      collection: 'yachts',
      id: created.id,
      depth: 1,
      overrideAccess: false,
    })
    expect(asVisitor.contact).toBeUndefined()
    expect(asVisitor.captain).toBeUndefined()
    expect(JSON.stringify(asVisitor)).not.toContain(contact.email)

    // And an editor, who runs the content, does not get them either.
    const editor = await createUser(registry)
    const asEditor = await registry.payload.findByID({
      collection: 'yachts',
      id: created.id,
      depth: 1,
      overrideAccess: false,
      user: editor,
    })
    expect(asEditor.contact).toBeUndefined()
  })
})

describe('provenance and the columns with no field of their own', () => {
  it('records where a listing came from and keeps the rest verbatim', async () => {
    const legacyAttributes = { new_yachts: { included_en: 'Fuel, crew', owner: 'A company' } }

    const created = await createYacht(registry, {
      legacyAttributes,
      provenance: {
        origin: 'yachts-sale',
        legacyId: 17,
        legacySlug: 'lady_m',
        importRunId: 'run-2026-09-13',
      },
      listingType: 'sale',
    })

    expect(created.legacyAttributes).toEqual(legacyAttributes)
    expect(created.provenance?.origin).toBe('yachts-sale')
    expect(created.provenance?.legacySlug).toBe('lady_m')
  })
})

describe('access', () => {
  it('is live for a visitor the moment it is saved, as the legacy catalogue was', async () => {
    // No draft state on the catalogue (issue #236): an editor saves and the listing is public.
    const saved = await createYacht(registry)

    const asVisitor = await registry.payload.find({
      collection: 'yachts',
      where: { id: { equals: saved.id } },
      overrideAccess: false,
    })

    expect(asVisitor.totalDocs).toBe(1)
  })

  it('is not writable anonymously and is writable by an editor', async () => {
    await expect(
      registry.payload.create({ collection: 'yachts', data: yachtData(), overrideAccess: false }),
    ).rejects.toThrow()

    const editor = await createUser(registry)
    const created = await registry.payload.create({
      collection: 'yachts',
      data: yachtData(),
      overrideAccess: false,
      user: editor,
    })
    registry.track('yachts', created.id)

    expect(created.id).toBeDefined()
  })
})

describe('revalidation', () => {
  it('drops the cached pages when a yacht is saved', async () => {
    revalidateTag.mockClear()
    await createYacht(registry)

    const tags = revalidateTag.mock.calls.map(([tag]) => tag as string)

    expect(tags).toContain('yachts')
  })
})

/**
 * The listing the recent yachts section reads (issue #133). The legacy page read the whole sale
 * table with no order and no limit (`docs/legacy-inventory.md` section 13, entry 52).
 */
describe('the listing the recent yachts section reads', () => {
  const client = () => Promise.resolve(registry.payload)

  it('lists the newest sale listings first, and only sale listings', async () => {
    const charter = await createYacht(registry, { name: `Charter ${uniqueSuffix()}` })
    const older = await createYacht(registry, {
      name: `Older ${uniqueSuffix()}`,
      listingType: 'sale',
    })
    const newer = await createYacht(registry, {
      name: `Newer ${uniqueSuffix()}`,
      listingType: 'sale',
    })

    const listed = await listSaleYachts('en', 500, client)
    const mine = listed.filter((yacht) =>
      [older.id, newer.id, charter.id].includes(yacht.id as number),
    )

    expect(mine.map((yacht) => yacht.id)).toEqual([newer.id, older.id])
  })

  it('asks for no more listings than the section is set to show', async () => {
    await createYacht(registry, { name: `Limit ${uniqueSuffix()}`, listingType: 'sale' })

    await expect(listSaleYachts('en', 1, client)).resolves.toHaveLength(1)
  })

  it('draws a photograph from the row that carries it, in the language being read', async () => {
    const upload = await createMedia(registry)
    const yacht = await createYacht(registry, {
      name: `Photographed ${uniqueSuffix()}`,
      listingType: 'sale',
      location: 'Monaco',
      photos: [{ media: upload.id, alt: 'Her bow' }],
    })
    await registry.payload.update({
      collection: 'yachts',
      id: yacht.id,
      locale: 'ru',
      data: { location: 'Монако' },
      overrideAccess: true,
    })

    const english = (await listSaleYachts('en', 500, client)).find((one) => one.id === yacht.id)
    const russian = (await listSaleYachts('ru', 500, client)).find((one) => one.id === yacht.id)

    expect(english?.photos[0]?.alt).toBe('Her bow')
    expect(english?.location).toBe('Monaco')
    expect(russian?.location).toBe('Монако')
  })

  it('leaves out a photograph that points at nothing rather than drawing a hole', async () => {
    const yacht = await createYacht(registry, {
      name: `Unphotographed ${uniqueSuffix()}`,
      listingType: 'sale',
      photos: [{ alt: 'Nothing to see' }],
    })

    const listed = (await listSaleYachts('en', 500, client)).find((one) => one.id === yacht.id)

    expect(listed?.photos).toEqual([])
  })

  it('lists none rather than taking the page down when the database cannot be reached', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    await expect(
      listSaleYachts('en', 5, () => Promise.reject(new Error('connection refused'))),
    ).resolves.toEqual([])
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })
})
