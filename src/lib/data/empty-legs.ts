import type { Payload } from 'payload'
import { cache } from 'react'

import type { Locale } from '@/i18n/locales'
import { airportName } from '@/lib/empty-leg'

import { getPayloadClient } from './payload'

/**
 * The repositioning flights the empty legs section lists (issue #117).
 *
 * The legacy section read the whole table with `select *`, then looked each of the two codes up
 * in `airports` with a wildcard `ILIKE` — two extra queries per row, English names whatever the
 * page language, and a row dropped from the page when a lookup missed
 * (`docs/legacy-inventory.md` section 6). Here the route ends are relationships resolved once
 * when the leg is saved, so one query with `depth: 1` reads the list and the airports with it.
 *
 * Ordering is `order` then `departureAt`, and a leg that has already flown keeps showing: both
 * are the decision recorded on issue #117, the second being what the legacy site did.
 */

/** One end of a route: the code as the leg was entered, and the airport when one is known. */
interface RouteEnd {
  icao: string
  airport?: string
}

export interface EmptyLegListing {
  id: number | string
  departureAt: string
  price?: number | null
  currency?: string
  from: RouteEnd
  to: RouteEnd
}

/** An airport as it arrives at `depth: 1`: the document, or its id when it was not populated. */
type RelatedAirport = number | string | { city?: string | null; country?: string | null } | null

function routeEnd(icao: string | null | undefined, airport: RelatedAirport): RouteEnd {
  const name = typeof airport === 'object' && airport !== null ? airportName(airport) : undefined

  return { icao: icao ?? '', airport: name }
}

/**
 * The legs a section shows, in the language of the page it is on.
 *
 * Read through `cache()`, as the chrome is, so two sections on one page share a query; the
 * prerendered page is the cache itself until Cache Components land (issue #178), and the
 * collection's `afterChange` hook drops it.
 *
 * An unreachable database renders the section without flights rather than taking the page down,
 * which is the legacy behaviour: every query it made was wrapped in `.catch(() => [])`
 * (`docs/legacy-inventory.md` section 8).
 */
export const listEmptyLegs = cache(
  async (
    locale: Locale,
    limit: number,
    // Injected so the integration tier can read through its own Payload instance.
    client: () => Promise<Payload> = getPayloadClient,
  ): Promise<EmptyLegListing[]> => {
    try {
      const payload = await client()
      const { docs } = await payload.find({
        collection: 'empty-legs',
        locale,
        // One level, for the two airports a card names; `populate` keeps that to the two columns
        // it prints rather than the whole airport (docs/conventions/rendering.md).
        depth: 1,
        populate: { airports: { city: true, country: true } },
        select: {
          arrivalAirport: true,
          arrivalIcao: true,
          currency: true,
          departureAirport: true,
          departureAt: true,
          departureIcao: true,
          price: true,
        },
        limit,
        // A section that shows the first few needs no count of the rest.
        pagination: false,
        sort: ['order', 'departureAt'],
        // Only what a visitor can read.
        overrideAccess: false,
      })

      return docs.map((leg) => ({
        id: leg.id,
        departureAt: leg.departureAt,
        price: leg.price,
        currency: leg.currency ?? undefined,
        from: routeEnd(leg.departureIcao, leg.departureAirport ?? null),
        to: routeEnd(leg.arrivalIcao, leg.arrivalAirport ?? null),
      }))
    } catch (error) {
      console.warn('[empty-legs] the database was unreachable, so the section lists none.', error)
      return []
    }
  },
)
