import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { charterChecks, failures, reconcile } from '../../scripts/migrate/reconcile'
import { importCharterYachts } from '../../scripts/migrate/yachts'
import { getTestPayload } from '../helpers/payload'
import { dropFixture, FIXTURE_SCHEMA, loadFixture } from './fixture'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }))

/**
 * The charter catalogue (issue #81): contacts first, then the yachts that point at them by a
 * legacy id with no foreign key, reconciled on counts, photo order and those references.
 */
let payload: Payload

const yacht = async (legacyId: number) => {
  const { docs } = await payload.find({
    collection: 'yachts',
    where: {
      'provenance.origin': { equals: 'new-yachts-charter' },
      'provenance.legacyId': { equals: legacyId },
    },
    locale: 'all',
    overrideAccess: true,
    depth: 0,
  })

  return docs[0] as unknown as Record<string, unknown> & { id: number }
}

beforeAll(async () => {
  payload = await getTestPayload()
  await loadFixture(payload, ['charter.sql'])
})

afterAll(async () => {
  await dropFixture(payload)
})

describe('importing the charter catalogue', () => {
  it('imports the contacts, then the yachts, lists the orphan, and reconciles', async () => {
    const { reports, orphans } = await importCharterYachts(payload, { schema: FIXTURE_SCHEMA })

    expect(reports.map(({ read, created }) => ({ read, created }))).toEqual([
      { read: 3, created: 3 },
      { read: 4, created: 4 },
    ])
    expect(orphans).toEqual([{ yacht: 2, column: 'contact_id', contact: 99 }])
    expect(failures(await reconcile(payload, charterChecks(FIXTURE_SCHEMA)))).toEqual([])
  })

  it('carries a row across in both languages, with its price, photos and people', async () => {
    const zeta = await yacht(1)

    expect(zeta).toMatchObject({
      name: 'Zeta One',
      listingType: 'charter',
      slug: 'zeta_one',
      location: { en: 'Dubai Marina' },
      length: 62,
      charter: {
        manufacturer: 'Azimut',
        owner: 'Zed Owner',
        customerPrice: 1200,
        currency: 'AED',
        businessPrice: 900,
        minHours: 3,
        guestsDay: 12,
        guestsNight: 6,
        cabins: '3+1',
        bathrooms: '2 / 2',
        refit: 2020,
        included: { en: 'Captain, fuel', ru: 'Капитан, топливо' },
      },
      provenance: { origin: 'new-yachts-charter', legacyId: 1, legacySlug: 'zeta_one' },
    })
    expect((zeta.photos as { externalUrl: string }[]).map((photo) => photo.externalUrl)).toEqual([
      'https://images.example.test/zeta-1.jpg',
      'https://images.example.test/zeta-2.jpg',
      'https://images.example.test/zeta-3.jpg',
    ])
    expect(JSON.stringify(zeta.description)).toContain('Crew included.')
    expect(JSON.stringify(zeta.description)).toContain('День на воде.')
  })

  it('gives every yacht a URL of its own, whatever slug the legacy admin wrote', async () => {
    expect((await yacht(2)).slug).toBe('zvezda')
    expect((await yacht(3)).slug).toBe('zeta_one_3')
    expect(await yacht(4)).toMatchObject({ slug: 'nameless', name: 'nameless' })
  })

  it('keeps a price in a currency the site does not price in, rather than half of it', async () => {
    expect(await yacht(2)).toMatchObject({
      legacyAttributes: { customer_price: '800', currency: 'Rubles' },
    })
    expect(((await yacht(2)).charter as Record<string, unknown>).customerPrice ?? null).toBeNull()
  })

  it('keeps an email the field refuses, and names a contact the row left nameless', async () => {
    const { docs } = await payload.find({
      collection: 'contacts',
      where: { 'provenance.legacyContactId': { equals: 2 } },
      overrideAccess: true,
      depth: 0,
    })

    expect(docs[0]).toMatchObject({
      name: 'Contact 2',
      phone: '+971500000002',
      legacyAttributes: { email: 'not-an-email' },
    })
  })

  it('leaves the same documents behind when it is run again', async () => {
    const { reports } = await importCharterYachts(payload, { schema: FIXTURE_SCHEMA })

    expect(reports.map(({ skipped, created, updated }) => ({ skipped, created, updated }))).toEqual(
      [
        { skipped: 3, created: 0, updated: 0 },
        { skipped: 4, created: 0, updated: 0 },
      ],
    )
  })

  it('names a yacht whose captain or photos drifted from the row', async () => {
    const zeta = await yacht(1)
    await payload.update({
      collection: 'yachts',
      id: zeta.id,
      data: { captain: null, photos: [...(zeta.photos as object[])].slice(1) },
      overrideAccess: true,
      context: { skipRevalidation: true },
    })

    expect(failures(await reconcile(payload, charterChecks(FIXTURE_SCHEMA)))).toEqual([
      `${FIXTURE_SCHEMA}.new_yachts: every photo is in the place the photos array gave it: 5 discrepancies ({"found":"missing","legacy_id":1,"position":1,"url":"https://images.example.test/zeta-1.jpg"}, {"found":"unexpected","legacy_id":1,"position":1,"url":"https://images.example.test/zeta-2.jpg"}, {"found":"missing","legacy_id":1,"position":2,"url":"https://images.example.test/zeta-2.jpg"}, {"found":"unexpected","legacy_id":1,"position":2,"url":"https://images.example.test/zeta-3.jpg"}, {"found":"missing","legacy_id":1,"position":3,"url":"https://images.example.test/zeta-3.jpg"})`,
      `${FIXTURE_SCHEMA}.new_yachts: every contact and captain that exists is the one the row named: 1 discrepancy ({"legacy_id":1,"field":"captain","legacy_contact":3,"contact":null})`,
    ])
  })
})
