import type { Payload } from 'payload'

import { DEFAULT_LOCALES } from '../../src/i18n/locales'
import type { SeedOutcome } from './report'

/**
 * Two yachts for sale (issues #133 and #65, E2.5), so the recent yachts section has something to
 * carry: one filled in as the legacy table filled a row, and one an editor has only started.
 *
 * Sale listings only. The charter catalogue arrives with the pages that list it (E8.6).
 */
interface SeedYacht {
  name: string
  photos: number
  length: number
  location: { en: string; ru: string }
  sale: {
    shipyard?: string
    year?: number
    beam?: number
    draft?: number
    cabins?: number
    guests?: number
    crew?: number
    cruisingSpeed?: number
    maxSpeed?: number
  }
}

export const SEED_YACHTS: readonly SeedYacht[] = [
  {
    name: 'Aurora',
    photos: 2,
    length: 120,
    location: { en: 'Monaco', ru: 'Монако' },
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
  },
  {
    name: 'Meridian',
    photos: 1,
    length: 88,
    location: { en: 'Dubai', ru: 'Дубай' },
    sale: { shipyard: 'Sunseeker', guests: 8, cabins: 4, crew: 5 },
  },
]

export async function seedYachts(payload: Payload): Promise<SeedOutcome[]> {
  const outcomes: SeedOutcome[] = []
  // The placeholder uploads the rest of the fixture draws (issue #41).
  const media = await payload.find({
    collection: 'media',
    limit: 2,
    depth: 0,
    sort: 'id',
    overrideAccess: true,
  })

  for (const yacht of SEED_YACHTS) {
    const existing = await payload.find({
      collection: 'yachts',
      where: { and: [{ name: { equals: yacht.name } }, { listingType: { equals: 'sale' } }] },
      limit: 1,
      overrideAccess: true,
    })

    if (existing.totalDocs > 0) {
      outcomes.push({
        collection: 'yachts',
        key: yacht.name,
        action: 'unchanged',
        id: existing.docs[0].id,
      })
      continue
    }

    const created = await payload.create({
      collection: 'yachts',
      data: {
        name: yacht.name,
        listingType: 'sale',
        length: yacht.length,
        location: yacht.location.en,
        photos: media.docs
          .slice(0, yacht.photos)
          .map((doc) => ({ media: doc.id, alt: `${yacht.name}, a yacht for sale` })),
        sale: yacht.sale,
        provenance: { origin: 'manual' },
      },
      locale: 'en',
      overrideAccess: true,
      // A bulk write has nothing to invalidate (docs/conventions/rendering.md).
      context: { skipRevalidation: true },
    })

    // The other routed locales are translations of the same listing, not new ones.
    for (const locale of DEFAULT_LOCALES.filter((entry) => entry !== 'en'))
      await payload.update({
        collection: 'yachts',
        id: created.id,
        data: { location: yacht.location[locale as 'ru'] },
        locale,
        overrideAccess: true,
        context: { skipRevalidation: true },
      })

    outcomes.push({ collection: 'yachts', key: yacht.name, action: 'created', id: created.id })
  }

  return outcomes
}
