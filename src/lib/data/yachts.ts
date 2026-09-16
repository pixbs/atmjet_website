import type { Payload } from 'payload'
import { cache } from 'react'

import type { Locale } from '@/i18n/locales'
import { mediaSource, type ImageSource, type MediaLike } from '@/lib/media'
import {
  sortedCharter,
  type CharterOrderable,
  type CharterQuery,
  type SaleYachtFacts,
} from '@/lib/yachts'

import { getPayloadClient } from './payload'

/**
 * The yachts for sale, as the section that carries the carousel lists them (issue #133).
 *
 * The legacy page read the whole `yachts` table with no order and no limit
 * (`docs/legacy-inventory.md` section 13, entry 52, which leaves the ordering to the collection).
 * Newest first is what the heading promises — the section is called recent yachts — and the
 * limit is the block's, so a catalogue that grows does not turn one section into the page.
 */
export interface SaleYachtListing extends SaleYachtFacts {
  id: number | string
  name: string
  photos: ImageSource[]
  guests?: number | null
  cabins?: number | null
  crew?: number | null
}

/** One row of the photos array: the upload, or the address it still lives at (E5.12). */
interface YachtPhoto {
  media?: number | string | MediaLike | null
  externalUrl?: string | null
  alt?: string | null
}

/**
 * A photograph as a component draws it. The row carries its own alt and may carry its own
 * address, so what it says wins over the upload it points at.
 */
function photoSource(photo: YachtPhoto): ImageSource | null {
  const upload = typeof photo.media === 'object' && photo.media !== null ? photo.media : {}
  const external = (photo.externalUrl ?? '').trim()
  const alt = (photo.alt ?? '').trim()

  return mediaSource({
    ...upload,
    ...(external === '' ? {} : { externalUrl: external }),
    ...(alt === '' ? {} : { alt }),
  })
}

/**
 * The listings a section shows, in the language of the page it is on.
 *
 * Read through `cache()`, as the rest of the server data is, so two sections on one page share a
 * query. An unreachable database renders the section without listings rather than taking the
 * page down: the legacy page wrapped the same query in `.catch(() => [])` (section 8).
 */
export const listSaleYachts = cache(
  async (
    locale: Locale,
    limit: number,
    // Injected so the integration tier can read through its own Payload instance.
    client: () => Promise<Payload> = getPayloadClient,
  ): Promise<SaleYachtListing[]> => {
    try {
      const payload = await client()
      const { docs } = await payload.find({
        collection: 'yachts',
        locale,
        where: { listingType: { equals: 'sale' } },
        // One level, for the uploads the photographs point at. No `populate` alongside it: an
        // upload's `url` is computed from its filename, so narrowing the fields of the populated
        // document returns it as null and the photograph disappears.
        depth: 1,
        select: { name: true, length: true, location: true, photos: true, sale: true },
        limit,
        // A section that shows the first few needs no count of the rest.
        pagination: false,
        sort: '-createdAt',
        // Only what a visitor can read.
        overrideAccess: false,
      })

      return docs.map((yacht) => ({
        id: yacht.id,
        name: yacht.name,
        photos: (yacht.photos ?? []).flatMap((photo) => {
          const source = photoSource(photo)
          return source === null ? [] : [source]
        }),
        guests: yacht.sale?.guests,
        cabins: yacht.sale?.cabins,
        crew: yacht.sale?.crew,
        length: yacht.length,
        location: yacht.location,
        sale: yacht.sale,
      }))
    } catch (error) {
      console.warn('[yachts] the database was unreachable, so the section lists none.', error)
      return []
    }
  },
)

/**
 * One yacht as the charter listing draws it (issue #139, `docs/legacy-inventory.md` section 4):
 * the photograph, the maker and the name over it, the hourly price in a badge, and the six
 * figures under the rule.
 */
export interface CharterYachtListing extends CharterOrderable {
  id: number | string
  slug?: string | null
  name: string
  manufacturer?: string | null
  currency?: string | null
  minHours?: number | null
  cabins?: string | null
  bathrooms?: string | null
  refit?: number | null
  photo: ImageSource | null
}

/**
 * The charter fleet, in the order the URL asks for (issue #139).
 *
 * One query and no paging, as the legacy page had: it read the whole `new_yachts` table and drew
 * every row. What it did not do is survive an empty one — the ranges it derived for a slider
 * nobody could see indexed the first element of an empty array and threw (section 13, entry 51)
 * — so an unreachable database renders an empty listing here rather than taking the page down.
 */
export const searchCharterYachts = cache(
  async (
    locale: Locale,
    query: Pick<CharterQuery, 'sort' | 'direction'>,
    // Injected so the integration tier can read through its own Payload instance.
    client: () => Promise<Payload> = getPayloadClient,
  ): Promise<CharterYachtListing[]> => {
    try {
      const payload = await client()
      const { docs } = await payload.find({
        collection: 'yachts',
        locale,
        where: { listingType: { equals: 'charter' } },
        // One level, for the uploads the photographs point at.
        depth: 1,
        select: { name: true, slug: true, length: true, photos: true, charter: true },
        // The whole fleet, as the legacy page read it.
        limit: 0,
        pagination: false,
        sort: 'name',
        // Only what a visitor can read.
        overrideAccess: false,
      })

      return sortedCharter(
        docs.map((yacht) => ({
          id: yacht.id,
          slug: yacht.slug,
          name: yacht.name,
          manufacturer: yacht.charter?.manufacturer,
          price: yacht.charter?.customerPrice,
          currency: yacht.charter?.currency,
          length: yacht.length,
          guests: yacht.charter?.guestsDay,
          minHours: yacht.charter?.minHours,
          cabins: yacht.charter?.cabins,
          bathrooms: yacht.charter?.bathrooms,
          refit: yacht.charter?.refit,
          photo: photoSource(yacht.photos?.[0] ?? {}),
        })),
        query,
      )
    } catch (error) {
      console.warn('[yachts] the database was unreachable, so the listing is empty.', error)
      return []
    }
  },
)
