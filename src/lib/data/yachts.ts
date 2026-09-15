import type { Payload } from 'payload'
import { cache } from 'react'

import type { Locale } from '@/i18n/locales'
import { mediaSource, type ImageSource, type MediaLike } from '@/lib/media'
import type { SaleYachtFacts } from '@/lib/yachts'

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
