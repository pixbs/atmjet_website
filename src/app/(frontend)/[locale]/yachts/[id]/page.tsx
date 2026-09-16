import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound, redirect } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { KeyStatsCard } from '@/components/cards/key-stats-card'
import { YachtRequest } from '@/components/form/yacht-request'
import { Bathrooms, Cabins, Clock, Guests, Length, Tools } from '@/components/icons'
import { Line } from '@/components/motion/line'
import { Gallery } from '@/components/ui/gallery'
import { JsonLd } from '@/components/ui/json-ld'
import type { Locale } from '@/i18n/locales'
import { resolveYacht, yachtPhotographs } from '@/lib/data/yachts'
import { getEnabledLocales } from '@/lib/data/site-settings'
import type { ImageSource } from '@/lib/media'
import { pageMetadata } from '@/lib/metadata'
import { breadcrumbs } from '@/lib/structured-data'
import { siteOrigin } from '@/lib/urls'

/**
 * One charter yacht (issue #140, `docs/legacy-inventory.md` section 4, route
 * `/[locale]/yachts/[id]`): the photograph it is met by, the gallery of the rest, and the card
 * that asks for it.
 *
 * A slug no yacht answers to goes to the listing, which is what the legacy page did with
 * `redirect('/yachts')` — unprefixed there, so it answered only through the middleware, and
 * carrying the locale here. A yacht with no photographs goes the same way: the legacy page
 * refused to draw one (`if (!yacht || !yacht.photos) redirect('/yachts')`) and the gallery the
 * card sits beside would be an empty column.
 */
/**
 * The `size-10` the legacy gave every icon beside a figure, in the near-black the cards are
 * outlined in (the legacy `text-gray-300`, ADR-0006); the `color-gray` beside it was never a
 * class at all (`docs/legacy-inventory.md` section 13, entry 17).
 */
const STAT_ICON = 'size-10 shrink-0 text-graphite-800'

interface DetailParams {
  locale: string
  id: string
}

/** The name the page is titled with, as the listing card composes it. */
const nameOf = (yacht: { manufacturer?: string | null; name: string }): string =>
  [yacht.manufacturer, yacht.name && `"${yacht.name}"`].filter(Boolean).join(' ')

/** Each photograph answers to the yacht's own name where the row carries no words of its own. */
const named = (photographs: ImageSource[], name: string): ImageSource[] =>
  photographs.map((photo) => (photo.alt === '' ? { ...photo, alt: name } : photo))

export async function generateMetadata({
  params,
}: {
  params: Promise<DetailParams>
}): Promise<Metadata> {
  const { locale, id } = await params
  const [yacht, locales, t] = await Promise.all([
    resolveYacht(id, locale as Locale),
    getEnabledLocales(),
    getTranslations({ locale, namespace: 'seo' }),
  ])

  // A slug no yacht answers to is a redirect, and inherits the layout's defaults.
  if (!yacht) return {}

  const photographs = yachtPhotographs(yacht.photos)

  return pageMetadata({
    locale: locale as Locale,
    locales,
    slug: `yachts/${id}`,
    title: nameOf({ manufacturer: yacht.charter?.manufacturer, name: yacht.name }),
    description: yacht.description || t('siteDescription'),
    image: photographs[0]?.src,
    siteName: t('siteName'),
    origin: siteOrigin(),
  })
}

export default async function YachtDetailPage({ params }: { params: Promise<DetailParams> }) {
  const { locale, id } = await params

  // A prefix that is not an enabled locale never reaches a page: the proxy stops routing it and
  // this is the second door, for a request that arrives at the route directly (issue #53).
  const locales = await getEnabledLocales()
  if (!locales.includes(locale as Locale)) notFound()

  setRequestLocale(locale)

  const yacht = await resolveYacht(id, locale as Locale)
  const photographs = named(
    yachtPhotographs(yacht?.photos),
    yacht ? nameOf({ manufacturer: yacht.charter?.manufacturer, name: yacht.name }) : '',
  )
  if (!yacht || photographs.length === 0) redirect(`/${locale}/yachts`)

  const t = await getTranslations({ locale, namespace: 'yacht' })
  const form = await getTranslations({ locale, namespace: 'form' })
  const common = await getTranslations({ locale, namespace: 'common' })

  const charter = yacht.charter ?? {}
  const name = nameOf({ manufacturer: charter.manufacturer, name: yacht.name })
  /** `4,500 AED/Hour`, as the legacy card composed it under the button. */
  const price =
    typeof charter.customerPrice === 'number' && charter.currency
      ? `${charter.customerPrice.toLocaleString(locale)} ${charter.currency}/${t('hour')}`
      : ''
  const trail = breadcrumbs(siteOrigin(), locale as Locale, common('home'), {
    slug: `yachts/${id}`,
    title: name,
  })
  const units = await getTranslations({ locale, namespace: 'units' })
  const printed = (value: string | number | null | undefined): string =>
    value === null || value === undefined ? '' : String(value)

  /** The six figures, in the order the legacy card drew them. */
  const stats = [
    {
      icon: <Guests className={STAT_ICON} />,
      // `20 / 12`, as the legacy printed the two together.
      value: `${printed(charter.guestsDay)} / ${printed(charter.guestsNight)}`,
      label: t('stats.paxDayNight'),
    },
    {
      icon: <Length className={STAT_ICON} />,
      value: `${printed(yacht.length)} / ${printed(yacht.length === null || yacht.length === undefined ? null : Math.round(yacht.length * 0.3048))}`,
      label: t('stats.lengthFtM'),
    },
    {
      icon: <Cabins className={STAT_ICON} />,
      value: printed(charter.cabins),
      label: t('stats.cabins'),
    },
    {
      icon: <Bathrooms className={STAT_ICON} />,
      value: printed(charter.bathrooms),
      label: t('stats.bathrooms'),
    },
    {
      icon: <Clock className={STAT_ICON} />,
      // The legacy wrote `4 hours` on the Russian page too (section 13, entry 49).
      value: units('hours', { count: charter.minHours ?? 0 }),
      label: t('stats.minHours'),
    },
    {
      icon: <Tools className={STAT_ICON} />,
      value: printed(charter.refit),
      label: t('stats.refit'),
    },
  ]

  /**
   * One paragraph per line of the description. The legacy split it on full stops and dropped
   * whatever followed the last one, so a sentence ending in an abbreviation or a decimal broke
   * in two and the closing words were lost (section 13, entry 50); the field holds the breaks
   * an editor typed, which is the decision of E4.13.
   */
  const paragraphs = (yacht.description ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '')

  /** The photograph the lower section opens with, and the ones the legacy stacked under it. */
  const last = photographs[photographs.length - 1]
  const stacked = photographs.slice(2, -1).slice(2)

  return (
    <>
      <section className="md:pb-24" data-section="yacht-detail">
        {/* The band the page opens on: the first photograph behind the card, dimmed from both
            ends, with the card pulled up over its foot as the legacy `mb-[-80px]` did. A
            background rather than an `<Image>`, because `bg-fixed` is what holds it still while
            the page scrolls over it, which is how the legacy band moved. */}
        <div
          className="relative -z-1 -mb-hero-overlap h-hero-band w-full overflow-hidden bg-cover bg-fixed bg-center"
          style={{ backgroundImage: `url("${photographs[0]?.src}")` }}
        >
          <div className="absolute inset-0 z-10 bg-linear-to-b from-graphite-900 to-transparent" />
          <div className="absolute inset-0 z-10 bg-linear-to-t from-graphite-900 to-transparent" />
        </div>
        {/* `.container` is an unlayered parity rule, so its `flex` beats a plain `lg:grid`,
            which on the legacy site was in a layer and won (ADR-0006); its gap is overridden the
            same way the legacy `!gap-10` overrode it. */}
        <div className="container gap-10! lg:grid! lg:grid-cols-2">
          {/* The second photograph, as the legacy opened on; the gallery brings that back to the
              first where there is no second (section 13, entry 45, settled in #101). */}
          <Gallery images={photographs} selected={1} />
          <div className="gap-8 rounded-3xl border border-graphite-800 bg-graphite-950 p-6 py-10 md:p-10">
            <h1>{name}</h1>
            <YachtRequest
              labels={{
                from: form('from'),
                date: form('date'),
                hours: form('hours'),
                guests: t('guests'),
                submit: t('request', { name: yacht.name }),
              }}
              location={yacht.location ?? ''}
              // The two fallbacks are the legacy `guestsDay || 10` and `minHours || 1`.
              maxGuests={charter.guestsDay ?? 10}
              minHours={charter.minHours ?? 1}
              price={price}
              source="Yachts_detail"
            />
          </div>
        </div>
      </section>
      {/* Full width, as the legacy drew it between the sections of this page. */}
      <Line />
      <section className="md:py-16 md:pb-24" data-section="yacht-specs">
        <div className="container gap-12">
          <div className="gap-10 md:grid md:grid-cols-2">
            <div className="overflow-clip">
              {last && (
                <Image
                  alt={last.alt}
                  className="sticky top-hero-band rounded-3xl border border-graphite-800 bg-graphite-950"
                  height={400}
                  src={last.src}
                  width={600}
                />
              )}
            </div>
            {/* The rule after the last figure is the yacht card's own; the aircraft card stops
                at the one before it (section 4). */}
            <KeyStatsCard ruleAfterLast stats={stats} title={t('keyStats')}>
              {charter.included && (
                <div className="col-span-full">
                  <p>{t('included')}</p>
                  <h3>{charter.included}</h3>
                </div>
              )}
            </KeyStatsCard>
          </div>
          <div className="relative items-start gap-6 md:grid md:grid-cols-2 md:gap-10">
            <div className="top-hero-band gap-6 rounded-3xl border border-graphite-800 bg-graphite-950 p-6 py-10 pb-16 md:sticky md:gap-10 md:self-start md:p-10">
              <h2>{t('about', { name: yacht.name })}</h2>
              <div className="flex flex-col gap-4">
                {paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
            {/* The legacy took `photos.slice(2, -1).slice(2)`, which is the fifth photograph to
                the second from last: the first four are spoken for by the band and the gallery. */}
            <div className="gap-10">
              {stacked.map((photo) => (
                <Image
                  key={photo.src}
                  alt={photo.alt}
                  className="rounded-3xl border border-graphite-800 bg-graphite-950"
                  height={400}
                  src={photo.src}
                  width={600}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
      <Line />
      {trail && <JsonLd data={trail} />}
    </>
  )
}
