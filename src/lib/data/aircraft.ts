import type { Payload } from 'payload'
import { cache } from 'react'

import type { Locale } from '@/i18n/locales'
import { mediaSource, type ImageSource } from '@/lib/media'

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
