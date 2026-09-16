'use client'

import { Select } from '@/components/ui/select'
import { usePathname, useRouter } from '@/i18n/navigation'
import {
  AIRCRAFT_LISTING,
  AIRCRAFT_SORTS,
  type AircraftQuery,
  type AircraftSort,
} from '@/lib/aircraft'
import { listingSearch, type ListingDirection } from '@/lib/listing'
import { localeSwitchHref } from '@/lib/urls'

/**
 * The two selects of the aircraft filter card (issue #135, `docs/legacy-inventory.md` section 4):
 * what the listing is sorted by, and which way round.
 *
 * A choice is a navigation rather than a fetch: the URL holds the state, so the order a visitor
 * picked can be linked to and the server renders the cards for it. The legacy pair kept the
 * choice in React state, which is why "show more" lost it (section 13, entry 25).
 *
 * The selects are uncontrolled and keyed on the state the server rendered: what a visitor picks
 * stays on screen while the page they asked for is being fetched, and going back puts the
 * choice that page was rendered with back in the boxes.
 */
export interface AircraftSortProps {
  labels: {
    sort: string
    order: string
    ascending: string
    descending: string
    sorts: Record<AircraftSort, string>
  }
  /** The state the URL is in, as the page read it. */
  query: AircraftQuery
}

export function AircraftSort({ labels, query }: AircraftSortProps) {
  const router = useRouter()
  const pathname = usePathname()

  // Back to the first batch: the cards already read were in the order being left behind.
  const choose = (change: Partial<AircraftQuery>) =>
    router.push(
      localeSwitchHref(pathname, listingSearch({ ...query, ...change, page: 1 }, AIRCRAFT_LISTING)),
    )

  return (
    <div className="grid gap-0.5 overflow-hidden rounded-2xl md:grid-cols-2 md:gap-4 md:rounded-none">
      <Select
        key={`sort-${query.sort}`}
        defaultValue={query.sort}
        id="sort"
        label={labels.sort}
        name="sort"
        onChange={(event) => choose({ sort: event.target.value as AircraftSort })}
      >
        {AIRCRAFT_SORTS.map((sort) => (
          <option key={sort} value={sort}>
            {labels.sorts[sort]}
          </option>
        ))}
      </Select>
      <Select
        key={`direction-${query.direction}`}
        defaultValue={query.direction}
        id="direction"
        label={labels.order}
        name="direction"
        onChange={(event) => choose({ direction: event.target.value as ListingDirection })}
      >
        <option value="asc">{labels.ascending}</option>
        <option value="desc">{labels.descending}</option>
      </Select>
    </div>
  )
}
