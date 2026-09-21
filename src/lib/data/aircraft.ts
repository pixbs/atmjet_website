import type { Payload, Where } from 'payload'
import { cache } from 'react'

import type { Locale } from '@/i18n/locales'
import {
  aircraftSlug,
  registrationsInSlug,
  type AircraftQuery,
  type AircraftSort,
} from '@/lib/aircraft'
import { mediaSource, type ImageSource } from '@/lib/media'
import type { Listable } from '@/lib/sitemap'

import { getPayloadClient } from './payload'

/**
 * The aircraft the sales department page shows under "most-flown business aircraft"
 * (issue #142, `docs/legacy-inventory.md` section 4).
 *
 * The legacy page read the `vehicles` table ordered by the year painted on the aircraft, newest
 * first, and took fifteen; the order is the same here and the limit is the block's. An aircraft
 * an editor has marked unavailable is left out: the legacy catalogue had no such state, a row
 * being live the moment it was saved (issue #236), and this collection does.
 */
export interface AircraftListing {
  id: number | string
  registration: string
  model: string
  year?: number | null
  passengers?: number | null
  image: ImageSource | null
}

/**
 * The listings a section shows, in the language of the page it is on.
 *
 * Read through `cache()`, as the rest of the server data is, so two sections on one page share a
 * query. An unreachable database renders the section without listings rather than taking the
 * page down: the legacy page wrapped the same query in `.catch(() => [])` (section 8).
 */
export const listCatalogueAircraft = cache(
  async (
    locale: Locale,
    limit: number,
    // Injected so the integration tier can read through its own Payload instance.
    client: () => Promise<Payload> = getPayloadClient,
  ): Promise<AircraftListing[]> => {
    try {
      const payload = await client()
      const page = async (dated: boolean, take: number) => {
        const { docs } = await payload.find({
          collection: 'aircraft',
          locale,
          where: {
            and: [
              { availability: { equals: 'available' } },
              { 'specification.yearOfProduction': { exists: dated } },
            ],
          },
          // One level, for the uploads the photographs point at. No `populate` alongside it: an
          // upload's `url` is computed from its filename, so narrowing the fields of the
          // populated document returns it as null and the photograph disappears.
          depth: 1,
          select: { registrationDisplay: true, type: true, specification: true, images: true },
          limit: take,
          // A section that shows the first few needs no count of the rest.
          pagination: false,
          sort: dated ? '-specification.yearOfProduction' : '-createdAt',
          // Only what a visitor can read.
          overrideAccess: false,
        })

        return docs
      }

      // Two queries rather than one, because Postgres orders a descending column nulls first and
      // the legacy `CASE … DESC NULLS LAST` put the aircraft with no year painted on them last.
      const dated = await page(true, limit)
      const docs = [
        ...dated,
        ...(dated.length >= limit ? [] : await page(false, limit - dated.length)),
      ]

      return docs.map((aircraft) => ({
        id: aircraft.id,
        registration: aircraft.registrationDisplay,
        model: aircraft.type?.model ?? aircraft.type?.name ?? aircraft.registrationDisplay,
        year: aircraft.specification?.yearOfProduction,
        passengers: aircraft.specification?.passengers,
        image: mediaSource(
          typeof aircraft.images?.[0]?.media === 'object' ? aircraft.images[0].media : null,
        ),
      }))
    } catch (error) {
      console.warn('[aircraft] the database was unreachable, so the section lists none.', error)
      return []
    }
  },
)

/**
 * One aircraft as the listing draws it (issue #135, `docs/legacy-inventory.md` section 4): the
 * photograph, the type and registration over it, and the class under the rule.
 */
export interface AircraftSummary {
  id: number | string
  /**
   * Where the card leads. The legacy card used `aircrafts.slug`; a document that has none yet is
   * reached by its registration, which is what the detail route resolves until the slugs arrive
   * with the import (issue #138).
   */
  slug: string
  name: string
  registration: string
  category: string
  image: ImageSource
}

export interface AircraftSearch {
  aircraft: AircraftSummary[]
  /** How many the catalogue holds under this sort, so the page knows whether to offer more. */
  total: number
}

/**
 * What puts an aircraft in the catalogue: the commercial state, and the exterior photograph a
 * card is drawn from. The sitemap asks the same question, so it advertises the pages the
 * listing links to and no others (issue #171).
 */
const CATALOGUED: Where[] = [
  { availability: { equals: 'available' } },
  { 'images.type': { equals: 'exterior' } },
]

/** The column each sort names. `size` is the cabin height the legacy sorted under that word. */
const SORTED_BY: Record<AircraftSort, string> = {
  size: 'specification.cabinHeight',
  passengers: 'specification.passengers',
  range: 'specification.rangeMaximum',
}

/**
 * The aircraft a listing URL asks for (issue #135).
 *
 * Three of the legacy list's defects are fixed here rather than reproduced (section 13, entries
 * 23, 24 and 26). Sorting by passengers sorts by passengers; no passenger range is applied, so
 * an aircraft whose seat count nobody has filled in is still listed; and the aircraft without a
 * photograph are left out by the query rather than dropped from the answer afterwards, which is
 * what made the legacy batches shorter than the fifteen they claimed.
 *
 * Two queries rather than one, as the sales department carousel needs for the same reason:
 * Postgres orders a descending column nulls first, so the aircraft nobody has measured would
 * open the list under "the longest range first". They go last under either order, and the second
 * query is the count of them, which the first page needs anyway to know whether to offer more.
 */
export const searchAircraft = cache(
  async (
    locale: Locale,
    query: AircraftQuery,
    // Injected so the integration tier can read through its own Payload instance.
    client: () => Promise<Payload> = getPayloadClient,
  ): Promise<AircraftSearch> => {
    const field = SORTED_BY[query.sort]
    // The page is how far the listing has been read, so it holds every batch up to it.
    const shown = query.page * query.perPage

    try {
      const payload = await client()
      const read = (measured: boolean, take: number) =>
        payload.find({
          collection: 'aircraft',
          locale,
          where: { and: [...CATALOGUED, { [field]: { exists: measured } }] },
          // One level, for the uploads the photographs point at; no `populate` beside it, or an
          // upload's computed `url` comes back null and the photograph disappears.
          depth: 1,
          select: { slug: true, registrationDisplay: true, type: true, images: true },
          // Never nothing: a batch that is already full still asks for the count of the rest.
          limit: Math.max(take, 1),
          sort: measured ? (query.direction === 'desc' ? `-${field}` : field) : '-createdAt',
          // Only what a visitor can read.
          overrideAccess: false,
        })

      const measured = await read(true, shown)
      const room = shown - measured.docs.length
      const unmeasured = await read(false, room)

      return {
        aircraft: [...measured.docs, ...unmeasured.docs.slice(0, Math.max(room, 0))].flatMap(
          (one) => {
            const cover = one.images?.find((entry) => entry.type === 'exterior')?.media
            // An upload an editor has deleted leaves a card with nothing to draw; the query
            // has already left out the aircraft that never had a photograph.
            const image = mediaSource(typeof cover === 'object' ? cover : null)
            if (image === null) return []

            return [
              {
                id: one.id,
                slug: aircraftSlug(one),
                name: one.type?.name ?? one.type?.model ?? one.registrationDisplay,
                registration: one.registrationDisplay,
                category: one.type?.category ?? '',
                image,
              },
            ]
          },
        ),
        total: measured.totalDocs + unmeasured.totalDocs,
      }
    } catch (error) {
      console.warn('[aircraft] the database was unreachable, so the listing is empty.', error)
      return { aircraft: [], total: 0 }
    }
  },
)

/**
 * The aircraft a detail-page slug names, or nothing (issue #138).
 *
 * Three ways in, in the order the legacy page would have found them: the slug the listing card
 * writes, the registration its first two parts name, and the whole slug read as a registration.
 * Both columns are unique, so an attempt answers with one document or none and the provenance
 * order the issue asks for can never be needed to choose between two.
 *
 * `cache()`, as the rest of the server data is: the head and the body of one request ask once.
 */
export const resolveAircraft = cache(
  async (
    slug: string,
    locale: Locale,
    // Injected so the integration tier can read through its own Payload instance.
    client: () => Promise<Payload> = getPayloadClient,
  ) => {
    try {
      const payload = await client()
      const find = async (where: Where) => {
        const { docs } = await payload.find({
          collection: 'aircraft',
          locale,
          where,
          // One level, for the uploads the photographs point at.
          depth: 1,
          limit: 1,
          // Only what a visitor can read.
          overrideAccess: false,
        })

        return docs[0]
      }

      return (
        (await find({ slug: { equals: slug } })) ??
        (await find({ registration: { in: registrationsInSlug(slug) } }))
      )
    } catch (error) {
      console.warn(
        '[aircraft] the database was unreachable, so the page cannot be resolved.',
        error,
      )
      return undefined
    }
  },
)

/**
 * Every aircraft `/aircraft/sitemap.xml` offers a crawler (issue #171).
 *
 * The legacy sitemap at this path enumerated the `vehicles` table into unprefixed URLs
 * (`docs/legacy-inventory.md` section 2.3); this reads the catalogue through the same predicate
 * the listing does, so a crawler is sent to the pages the site itself links to.
 */
export async function listAircraftForSitemap(
  // Injected so the unreachable-database path can be tested without breaking the database.
  client: () => Promise<Payload> = getPayloadClient,
): Promise<Listable[]> {
  try {
    const payload = await client()
    const { docs } = await payload.find({
      collection: 'aircraft',
      where: { and: CATALOGUED },
      depth: 0,
      select: { slug: true, registrationDisplay: true, updatedAt: true },
      limit: 0,
      pagination: false,
      // Only what a visitor can read.
      overrideAccess: false,
    })

    return docs.map((one) => ({ slug: aircraftSlug(one), updatedAt: one.updatedAt }))
  } catch (error) {
    console.warn(
      '[aircraft] the sitemap is empty: the content database was unreachable at build time.',
      error,
    )
    return []
  }
}
