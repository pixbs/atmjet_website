import { getLocale, getTranslations } from 'next-intl/server'

import { VehicleCard } from '@/components/cards/vehicle-card'
import { VehiclesCarousel } from '@/components/cards/vehicles-carousel'
import type { Locale } from '@/i18n/locales'
import { listCatalogueAircraft } from '@/lib/data/aircraft'

/**
 * The aircraft carousel (issue #142, `docs/legacy-inventory.md` section 4): the heading and,
 * under it, the catalogue a row of cards at a time.
 *
 * The aircraft are read here rather than handed in, as the yachts are (issue #133): they are
 * documents and not fields, so the block passes the heading and this asks the collection for the
 * rest, on the server (ADR-0007). A catalogue with nothing in it draws no section at all, which
 * is what the legacy page did with an empty table.
 *
 * The labels the cards print come from the message catalogue. The legacy card wrote `Year:` and
 * `Pax:` in English on a site served in three languages (section 10.4).
 */
export interface CatalogueAircraftProps {
  title: string
  /** How many aircraft the carousel holds, newest first. */
  limit: number
}

export async function CatalogueAircraft({ title, limit }: CatalogueAircraftProps) {
  // The page has already refused a locale the site does not serve.
  const locale = (await getLocale()) as Locale
  const [aircraft, t] = await Promise.all([
    listCatalogueAircraft(locale, limit),
    getTranslations({ locale, namespace: 'aircraft' }),
  ])

  if (aircraft.length === 0) return null

  return (
    <section data-section="catalogue-aircraft">
      <div className="container">
        {/* The legacy card carried `rounded-2xl` as well, which never took effect: `.card` is
            unlayered and rounds it further (docs/adr/0006-styling-and-motion.md). The gutter is
            open on the right so the next card shows through the edge of the frame. */}
        <div className="card gap-8 bg-graphite-950 p-8 pr-0! md:gap-10 md:p-10">
          <h2>{title}</h2>
          <VehiclesCarousel labels={{ previous: t('previous'), next: t('next') }}>
            {aircraft.map(
              (one) =>
                // The card is its photograph and the rows under it; one with no photograph is
                // left out rather than drawn as an empty frame.
                one.image && (
                  <VehicleCard
                    key={one.id}
                    image={one.image}
                    model={one.model}
                    registration={one.registration}
                    specs={[
                      { label: t('year'), value: printable(one.year) },
                      { label: t('passengers'), value: printable(one.passengers) },
                    ]}
                  />
                ),
            )}
          </VehiclesCarousel>
        </div>
      </div>
    </section>
  )
}

/** A figure an editor has not filled in is printed as nothing, as the legacy card printed it. */
function printable(value: number | null | undefined): string {
  return value === null || value === undefined ? '' : String(value)
}
