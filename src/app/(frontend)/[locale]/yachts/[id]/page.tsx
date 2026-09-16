import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { YachtRequest } from '@/components/form/yacht-request'
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
      {trail && <JsonLd data={trail} />}
    </>
  )
}
