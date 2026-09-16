import { getLocale, getTranslations } from 'next-intl/server'

import { CharterYachtCard } from '@/components/cards/charter-yacht-card'
import { ListingFilters } from '@/components/form/listing-filters'
import { Bathrooms, Cabins, Clock, Guests, Length, Tools } from '@/components/icons'
import { Select } from '@/components/ui/select'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/cn'
import { searchCharterYachts, type CharterYachtListing } from '@/lib/data/yachts'
import { parseListing, type SearchParams } from '@/lib/listing'
import { CHARTER_LISTING, CHARTER_SORTS } from '@/lib/yachts'

/**
 * The charter listing (issue #139, `docs/legacy-inventory.md` section 4): the card the fleet is
 * narrowed with, and under it the yachts that are left.
 *
 * The cards are in the document the server sends, where the legacy page filtered and sorted the
 * whole table in the browser on every navigation. What is on screen has an address: the legacy
 * selects were written into the URL and then never read back out of it, so the boxes reset to
 * "All" the moment the page they had asked for arrived (section 4).
 */
export interface YachtsListingProps {
  title: string
  heading: string
  /** What the URL asked for, handed down by the route that serves the listing. */
  search: SearchParams
}

/** The `w-6 h-6` the legacy card gave every icon beside a figure. */
const ICON = 'size-6 shrink-0 text-graphite-300'

export async function YachtsListing({ title, heading, search }: YachtsListingProps) {
  // The page has already refused a locale the site does not serve.
  const locale = (await getLocale()) as Locale
  const query = parseListing(search, CHARTER_LISTING)
  const [yachts, t] = await Promise.all([
    searchCharterYachts(locale, query),
    getTranslations({ locale, namespace: 'yacht' }),
  ])
  const units = await getTranslations({ locale, namespace: 'units' })

  /** `4,500 AED / per hour`, as the legacy badge composed it. */
  const priceOf = (yacht: CharterYachtListing): string =>
    typeof yacht.price === 'number' && yacht.currency
      ? `${yacht.price.toLocaleString(locale)} ${yacht.currency} / ${t('perHour')}`
      : ''

  /** The six figures, in the order the legacy card drew them. */
  const figuresOf = (yacht: CharterYachtListing) =>
    [
      {
        value: yacht.guests,
        text: units('guests', { count: yacht.guests ?? 0 }),
        icon: <Guests className={ICON} />,
      },
      {
        value: yacht.length,
        // `120ft / 37m`, as the legacy card printed the two together.
        text: `${yacht.length}${t('feetShort')} / ${Math.round((yacht.length ?? 0) * 0.3048)}${t('metresShort')}`,
        icon: <Length className={ICON} />,
      },
      {
        value: yacht.cabins,
        text: `${yacht.cabins} ${t('cabinsShort')}`,
        icon: <Cabins className={ICON} />,
      },
      {
        value: yacht.minHours,
        text: `${t('minimum')} ${units('hours', { count: yacht.minHours ?? 0 })}`,
        icon: <Clock className={ICON} />,
      },
      {
        value: yacht.bathrooms,
        text: `${yacht.bathrooms} ${t('bathroomsShort')}`,
        icon: <Bathrooms className={ICON} />,
      },
      {
        value: yacht.refit,
        text: `${yacht.refit} ${t('refit')}`,
        icon: <Tools className={ICON} />,
      },
    ]
      // A figure nobody has filled in is left out rather than printed as `undefined`, which is
      // what the legacy card drew in its place.
      .filter(
        (figure) => figure.value !== null && figure.value !== undefined && figure.value !== '',
      )

  return (
    <>
      <ListingFilters apply={t('apply')} contract={CHARTER_LISTING} title={title}>
        <Select
          defaultValue={query.sort}
          id="sort"
          label={t('sortBy')}
          name="sort"
          wrapperClassName="md:rounded-none"
        >
          {CHARTER_SORTS.map((sort) => (
            <option key={sort} value={sort}>
              {t(`sorts.${sort}` as 'sorts.price')}
            </option>
          ))}
        </Select>
        <Select defaultValue={query.direction} id="direction" label={t('order')} name="direction">
          <option value="asc">{t('ascending')}</option>
          <option value="desc">{t('descending')}</option>
        </Select>
      </ListingFilters>
      <section className="gap-10 md:py-16 md:pb-24" data-section="yachts-listing">
        {/* `.container` is an unlayered parity rule, so its `flex` beats a plain `md:grid`,
            which on the legacy site was in a layer and won (ADR-0006). */}
        <div className="container gap-10 md:grid! md:grid-cols-2">
          <h2 className="col-span-full self-center md:text-center">{heading}</h2>
          {yachts.length === 0 ? (
            <div className="col-span-full items-center gap-6 rounded-3xl border border-graphite-800 bg-graphite-950 p-6 md:p-10">
              <h3>{t('none')}</h3>
              {/* The legacy button wore two class names the stylesheet never defined, so what it
                  rendered is the plain pill of the base layer. */}
              <Link className={cn(buttonVariants({ as: 'link' }))} href="/yachts">
                {t('reset')}
              </Link>
            </div>
          ) : (
            yachts.map((yacht) => (
              <CharterYachtCard
                key={yacht.id}
                figures={figuresOf(yacht)}
                photo={yacht.photo}
                price={priceOf(yacht)}
                slug={yacht.slug}
                title={[yacht.manufacturer, yacht.name && `"${yacht.name}"`]
                  .filter(Boolean)
                  .join(' ')}
              />
            ))
          )}
        </div>
      </section>
    </>
  )
}
