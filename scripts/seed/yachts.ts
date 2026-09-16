import type { Payload } from 'payload'

import { DEFAULT_LOCALES } from '../../src/i18n/locales'
import type { SeedOutcome } from './report'

/**
 * Two yachts for sale and four for charter (issues #133, #139 and #65, E2.5), so the section
 * that carries the recent ones and the page that lists the fleet both have something to draw:
 * filled in as the legacy tables filled a row, and one of each an editor has only started.
 *
 * The charter catalogue proper arrives with the import of E5.9; this is the fixture that lets
 * the listing be sorted and captured before it does.
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

/**
 * The charter fleet (issue #139). The lengths are feet, as both legacy cards read the column,
 * and the last yacht is one an editor has only started: nothing about it has been measured, so
 * it is the one the listing puts last whichever way round the order is asked for.
 */
interface SeedCharterYacht {
  name: string
  slug: string
  manufacturer: string
  photos: number
  length?: number
  /** Where she lies. The detail page's request card opens on it and cannot be edited (#140). */
  location?: string
  description?: string
  charter: {
    customerPrice?: number
    currency?: 'AED'
    guestsDay?: number
    minHours?: number
    cabins?: string
    bathrooms?: string
    refit?: number
  }
}

export const SEED_CHARTER_YACHTS: readonly SeedCharterYacht[] = [
  {
    name: 'Serenity',
    slug: 'azimut-serenity',
    manufacturer: 'Azimut',
    photos: 2,
    length: 78,
    location: 'Dubai Marina',
    description:
      'A flybridge with room for twenty on deck and four cabins below. Refitted in 2021 and kept in Dubai Marina, she leaves from the pontoon she is moored at.',
    charter: {
      customerPrice: 4500,
      currency: 'AED',
      guestsDay: 20,
      minHours: 4,
      cabins: '4',
      bathrooms: '4',
      refit: 2021,
    },
  },
  {
    name: 'Bluewater',
    slug: 'sunseeker-bluewater',
    manufacturer: 'Sunseeker',
    photos: 1,
    length: 55,
    location: 'Dubai Harbour',
    description:
      'Twelve guests, three cabins and a three-hour minimum. The one photograph she has is the one her gallery opens on.',
    charter: {
      customerPrice: 2800,
      currency: 'AED',
      guestsDay: 12,
      minHours: 3,
      cabins: '3',
      bathrooms: '3',
      refit: 2019,
    },
  },
  {
    name: 'Al Noor',
    slug: 'majesty-al-noor',
    manufacturer: 'Majesty',
    photos: 2,
    length: 110,
    location: 'Port Rashid',
    description:
      'The largest of the fleet: forty-five guests by day, six cabins and a crew that stays aboard.',
    charter: {
      customerPrice: 9500,
      currency: 'AED',
      guestsDay: 45,
      minHours: 5,
      cabins: '6',
      bathrooms: '6',
      refit: 2022,
    },
  },
  { name: 'Marina', slug: 'gulf-craft-marina', manufacturer: 'Gulf Craft', photos: 1, charter: {} },
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

  for (const yacht of SEED_CHARTER_YACHTS) {
    const existing = await payload.find({
      collection: 'yachts',
      where: { slug: { equals: yacht.slug } },
      limit: 1,
      overrideAccess: true,
    })

    if (existing.totalDocs > 0) {
      outcomes.push({
        collection: 'yachts',
        key: yacht.slug,
        action: 'unchanged',
        id: existing.docs[0].id,
      })
      continue
    }

    const created = await payload.create({
      collection: 'yachts',
      data: {
        name: yacht.name,
        slug: yacht.slug,
        listingType: 'charter',
        length: yacht.length,
        location: yacht.location,
        description: yacht.description,
        photos: media.docs
          .slice(0, yacht.photos)
          .map((doc) => ({ media: doc.id, alt: `${yacht.manufacturer} ${yacht.name}` })),
        charter: { manufacturer: yacht.manufacturer, ...yacht.charter },
        provenance: { origin: 'manual' },
      },
      locale: 'en',
      overrideAccess: true,
      // A bulk write has nothing to invalidate (docs/conventions/rendering.md).
      context: { skipRevalidation: true },
    })

    outcomes.push({ collection: 'yachts', key: yacht.slug, action: 'created', id: created.id })
  }

  return outcomes
}
