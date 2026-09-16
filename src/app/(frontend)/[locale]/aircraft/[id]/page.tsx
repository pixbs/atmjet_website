import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound, redirect } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Line } from '@/components/motion/line'
import { VehicleRequest } from '@/components/form/vehicle-request'
import { Gallery } from '@/components/ui/gallery'
import { JsonLd } from '@/components/ui/json-ld'
import type { Locale } from '@/i18n/locales'
import { resolveAircraft } from '@/lib/data/aircraft'
import { getEnabledLocales } from '@/lib/data/site-settings'
import { mediaSource } from '@/lib/media'
import { pageMetadata } from '@/lib/metadata'
import { breadcrumbs } from '@/lib/structured-data'
import { siteOrigin } from '@/lib/urls'

/**
 * One aircraft (issues #138 and #136, `docs/legacy-inventory.md` section 4, route
 * `/[locale]/aircraft/[id]`): the photograph it is met by, the gallery of the rest, and the card
 * that asks for it.
 *
 * The slug is resolved rather than parsed into a query: the legacy page split it on `-`, read
 * the first two parts as a registration and looked that up case-insensitively, so a catalogue
 * slug and a bare registration both answered. Both still do (`resolveAircraft`).
 *
 * An unknown slug goes to the listing, which is what the legacy page did with
 * `redirect('/aircraft')` — unprefixed there, so it answered only through the middleware; here
 * it carries the locale.
 */
interface DetailParams {
  locale: string
  id: string
}

export async function generateMetadata({
  params,
}: {
  params: Promise<DetailParams>
}): Promise<Metadata> {
  const { locale, id } = await params
  const [aircraft, locales, t] = await Promise.all([
    resolveAircraft(id, locale as Locale),
    getEnabledLocales(),
    getTranslations({ locale, namespace: 'seo' }),
  ])

  // A slug no aircraft answers to is a redirect, and inherits the layout's defaults.
  if (!aircraft) return {}

  const name = [aircraft.type?.name, aircraft.registrationDisplay].filter(Boolean).join(' ')
  const cover = mediaSource(
    typeof aircraft.images?.[0]?.media === 'object' ? aircraft.images[0].media : null,
  )

  return pageMetadata({
    locale: locale as Locale,
    locales,
    slug: `aircraft/${id}`,
    title: name,
    description: aircraft.description || t('siteDescription'),
    image: cover?.src,
    siteName: t('siteName'),
    origin: siteOrigin(),
  })
}

export default async function AircraftDetailPage({ params }: { params: Promise<DetailParams> }) {
  const { locale, id } = await params

  // A prefix that is not an enabled locale never reaches a page: the proxy stops routing it and
  // this is the second door, for a request that arrives at the route directly (issue #53).
  const locales = await getEnabledLocales()
  if (!locales.includes(locale as Locale)) notFound()

  setRequestLocale(locale)

  const aircraft = await resolveAircraft(id, locale as Locale)
  if (!aircraft) redirect(`/${locale}/aircraft`)

  const t = await getTranslations({ locale, namespace: 'aircraft' })
  const form = await getTranslations({ locale, namespace: 'form' })
  const common = await getTranslations({ locale, namespace: 'common' })

  const photographs = (aircraft.images ?? []).flatMap((entry) => {
    const image = mediaSource(typeof entry.media === 'object' ? entry.media : null)

    return image === null ? [] : [image]
  })
  const name = [aircraft.type?.name, aircraft.registrationDisplay].filter(Boolean).join(' ')
  const trail = breadcrumbs(siteOrigin(), locale as Locale, common('home'), {
    slug: `aircraft/${id}`,
    title: name,
  })

  return (
    <>
      <section className="md:pb-24" data-section="aircraft-detail">
        {/* The band the page opens on: the first photograph behind the card, dimmed from both
            ends, with the card pulled up over its foot as the legacy `mb-[-80px]` did. */}
        <div className="relative -z-1 -mb-hero-overlap h-hero-band w-full overflow-hidden">
          {photographs[0] && (
            <Image
              alt={photographs[0].alt === '' ? name : photographs[0].alt}
              className="object-cover object-center"
              fill
              priority
              sizes="100vw"
              src={photographs[0].src}
            />
          )}
          <div className="absolute inset-0 z-10 bg-linear-to-b from-graphite-900 to-transparent" />
          <div className="absolute inset-0 z-10 bg-linear-to-t from-graphite-900 to-transparent" />
        </div>
        {/* `.container` is an unlayered parity rule, so its `flex` beats a plain `lg:grid`,
            which on the legacy site was in a layer and won (ADR-0006); its gap is overridden the
            same way the legacy `!gap-10` overrode it. */}
        <div className="container gap-10! lg:grid! lg:grid-cols-2">
          <Gallery images={photographs} selected={photographs.length > 1 ? 1 : 0} />
          <div className="gap-8 rounded-3xl border border-graphite-800 bg-graphite-950 p-6 py-10 md:p-10">
            <h1>{name}</h1>
            <VehicleRequest
              labels={{
                from: form('from'),
                to: form('to'),
                date: form('date'),
                submit: t('request', { registration: aircraft.registrationDisplay }),
              }}
              locale={locale as Locale}
              source="Aircraft_detail"
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
