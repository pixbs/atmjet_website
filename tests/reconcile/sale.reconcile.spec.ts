import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { failures, reconcile, saleChecks } from '../../scripts/migrate/reconcile'
import { importSaleYachts } from '../../scripts/migrate/yachts'
import { getTestPayload } from '../helpers/payload'
import { dropFixture, FIXTURE_SCHEMA, loadFixture } from './fixture'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }))

/** The sale catalogue (issue #82), imported and reconciled on counts and picture order. */
let payload: Payload

const yacht = async (legacyId: number) => {
  const { docs } = await payload.find({
    collection: 'yachts',
    where: {
      'provenance.origin': { equals: 'yachts-sale' },
      'provenance.legacyId': { equals: legacyId },
    },
    overrideAccess: true,
    depth: 0,
  })

  return docs[0]
}

beforeAll(async () => {
  payload = await getTestPayload()
  await loadFixture(payload, ['sale.sql'])
})

afterAll(async () => {
  await dropFixture(payload)
})

describe('importing the sale catalogue', () => {
  it('writes a sale listing per row and reconciles', async () => {
    const report = await importSaleYachts(payload, { schema: FIXTURE_SCHEMA })

    expect(report).toMatchObject({ read: 3, created: 3 })
    expect(failures(await reconcile(payload, saleChecks(FIXTURE_SCHEMA)))).toEqual([])
  })

  it('keeps every column of the row, and no price the table never had', async () => {
    const zephyr = await yacht(1)

    expect(zephyr).toMatchObject({
      name: 'Zephyr',
      listingType: 'sale',
      slug: 'zephyr',
      location: 'Monaco',
      length: 120.5,
      sale: {
        shipyard: 'Benetti',
        year: 2019,
        beam: 25,
        draft: 8,
        cabins: 6,
        guests: 12,
        crew: 9,
        cruisingSpeed: 12,
        maxSpeed: 16,
      },
    })
    expect(zephyr?.sale?.price ?? null).toBeNull()
    expect(zephyr?.photos?.map((photo) => photo.externalUrl)).toEqual([
      'https://images.example.test/zephyr-1.jpg',
      'https://images.example.test/zephyr-2.jpg',
    ])
  })

  it('gives each yacht a URL of its own', async () => {
    expect((await yacht(2))?.slug).toBe('zephyr_2')
    expect((await yacht(3))?.slug).toBe('zvezda_morya')
  })

  it('leaves the same listings behind when it is run again', async () => {
    expect(await importSaleYachts(payload, { schema: FIXTURE_SCHEMA })).toMatchObject({
      read: 3,
      skipped: 3,
      created: 0,
    })
  })

  it('names the listing whose pictures went missing', async () => {
    await payload.update({
      collection: 'yachts',
      id: (await yacht(3))?.id as number,
      data: { photos: [] },
      overrideAccess: true,
      context: { skipRevalidation: true },
    })

    expect(failures(await reconcile(payload, saleChecks(FIXTURE_SCHEMA)))).toEqual([
      `${FIXTURE_SCHEMA}.yachts: every photo is in the place the pictures array gave it: 1 discrepancy ({"found":"missing","legacy_id":3,"position":1,"url":"https://images.example.test/zvezda.jpg"})`,
    ])
  })
})
