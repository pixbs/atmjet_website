import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'

import { AircraftCard } from '@/components/cards/aircraft-card'
import { AircraftSort } from '@/components/form/aircraft-sort'
import { Arrive, RiseText } from '@/components/motion/arrive'
import { buttonVariants } from '@/components/ui/button'
import type { Locale } from '@/i18n/locales'
import { AIRCRAFT_LISTING } from '@/lib/aircraft'
import { searchAircraft } from '@/lib/data/aircraft'
import { listingSearch, parseListing, type SearchParams } from '@/lib/listing'

/**
 * The aircraft listing (issue #135, `docs/legacy-inventory.md` section 4): the filter card, and
 * under it the catalogue in a grid that grows as a visitor asks for more.
 *
 * The cards are here when the page arrives, where the legacy list fetched them from the browser
 * after mount and so was empty on first paint and invisible to a crawler (section 13, entry 28).
 * "Show more" is a link to the next batch rather than a button that fetches one, so the whole
 * list a visitor is reading has an address.
 *
 * The filter card rises with its heading and then its selects, and the cards of a row arrive one
 * after another (section 13, entry 101).
 */

/** Seconds between one card arriving and the next, three to a row at the widest. */
const STAGGER = 0.1
export interface AircraftListingProps {
  title: string
  /** What the URL asked for, unread (`src/lib/listing.ts`). */
  search: SearchParams
}

export async function AircraftListing({ title, search }: AircraftListingProps) {
  // The page has already refused a locale the site does not serve.
  const locale = (await getLocale()) as Locale
  const query = parseListing(search, AIRCRAFT_LISTING)
  const [{ aircraft, total }, t] = await Promise.all([
    searchAircraft(locale, query),
    getTranslations({ locale, namespace: 'aircraft' }),
  ])

  return (
    <>
      <section data-section="aircraft-filter">
        <div className="container">
          <Arrive className="gap-6 rounded-3xl border border-graphite-800 bg-graphite-950 p-6 md:p-10">
            <RiseText as="h3" wait={0.15}>
              {title}
            </RiseText>
            {/* The selects arrive after the heading; the box adds no room. */}
            <Arrive wait={0.3}>
              <AircraftSort
                labels={{
                  sort: t('listing.sort'),
                  order: t('listing.order'),
                  ascending: t('listing.ascending'),
                  descending: t('listing.descending'),
                  sorts: {
                    size: t('listing.size'),
                    passengers: t('listing.passengers'),
                    range: t('listing.range'),
                  },
                }}
                query={query}
              />
            </Arrive>
          </Arrive>
        </div>
      </section>
      <section data-section="aircraft-listing">
        {/* `.container` is an unlayered parity rule, so its `flex` beats a plain `md:grid`,
            which on the legacy site was in a layer and won (docs/adr/0006-styling-and-motion.md).
            Below the breakpoint it is the column the flex leaves it as, as it was there. */}
        <div className="container gap-10 md:grid! md:grid-cols-2 lg:grid-cols-3">
          {aircraft.map((one, index) => (
            <AircraftCard
              key={one.id}
              category={one.category}
              image={one.image}
              name={one.name}
              registration={one.registration}
              slug={one.slug}
              wait={(index % 3) * STAGGER}
            />
          ))}
          {total > aircraft.length && (
            // The box that arrives takes the link's place in the grid; the link fills it.
            <Arrive className="col-span-full self-center">
              <Link
                className={buttonVariants({ as: 'link', size: 'big' })}
                href={`?${listingSearch({ ...query, page: query.page + 1 }, AIRCRAFT_LISTING)}`}
              >
                {t('listing.more')}
              </Link>
            </Arrive>
          )}
        </div>
      </section>
    </>
  )
}
