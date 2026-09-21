import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound, redirect } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { KeyStatsCard, type KeyStat } from '@/components/cards/key-stats-card'
import { Guests, Length, Tools } from '@/components/icons'
import { Line } from '@/components/motion/line'
import { VehicleRequest } from '@/components/form/vehicle-request'
import { detailSource } from '@/lib/flight-request'
import { Gallery } from '@/components/ui/gallery'
import { JsonLd } from '@/components/ui/json-ld'
import type { Locale } from '@/i18n/locales'
import { resolveAircraft } from '@/lib/data/aircraft'
import { getEnabledLocales } from '@/lib/data/site-settings'
import { mediaSource } from '@/lib/media'
import { pageMetadata } from '@/lib/metadata'
import { breadcrumbs, product } from '@/lib/structured-data'
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
  const origin = siteOrigin()
  const trail = breadcrumbs(origin, locale as Locale, common('home'), {
    slug: `aircraft/${id}`,
    title: name,
  })
  const printed = (value: number | null | undefined): string =>
    value === null || value === undefined ? '' : String(value)

  /**
   * The six figures, in the order the legacy card drew them, and each only where the catalogue
   * has it: the legacy hid a figure it had no value for rather than printing a zero
   * (`docs/legacy-inventory.md` section 4).
   */
  const specification = aircraft.specification ?? {}
  const stats: KeyStat[] = [
    {
      show: typeof specification.passengers === 'number',
      icon: <Guests className={STAT_ICON} />,
      value: printed(specification.passengers),
      label: t('stats.maxPax'),
    },
    {
      show: Boolean(aircraft.type?.category),
      icon: <Tools className={STAT_ICON} />,
      value: aircraft.type?.category ?? '',
      label: t('stats.type'),
    },
    {
      show: typeof specification.cabinHeight === 'number',
      icon: <Length className={STAT_ICON} />,
      value: t('metres', { value: printed(specification.cabinHeight) }),
      label: t('stats.cabinHeight'),
    },
    {
      // The legacy showed this pair on the length alone, and printed a zero for a width it
      // did not have; the zero is kept, the pair is what the label promises.
      show: typeof specification.cabinLength === 'number',
      icon: <Length className={STAT_ICON} />,
      value: [specification.cabinLength ?? 0, specification.cabinWidth ?? 0]
        .map((measure) => t('metres', { value: String(measure) }))
        .join('/'),
      label: t('stats.lengthWidth'),
    },
    {
      show: typeof specification.yearOfProduction === 'number',
      icon: <Tools className={STAT_ICON} />,
      value: printed(specification.yearOfProduction),
      label: t('stats.year'),
    },
    {
      show: typeof specification.rangeMaximum === 'number',
      icon: <Tools className={STAT_ICON} />,
      // Grouped in the language being read, where the legacy took the server's default.
      value: t('kilometres', {
        value: (specification.rangeMaximum ?? 0).toLocaleString(locale),
      }),
      label: t('stats.range'),
    },
  ].flatMap(({ show, ...stat }) => (show ? [stat] : []))

  /**
   * What the card says about the aircraft: the sentences the legacy built from the catalogue
   * rather than the `extension_description` column, which it never rendered on this page
   * (`docs/legacy-inventory.md` section 4). A value the catalogue has not got leaves its gap, as
   * the legacy left it; the column itself still feeds the head and the structured data.
   */
  const homeBase = typeof aircraft.baseAirport === 'object' ? aircraft.baseAirport : null
  const paragraphs = t('summary', {
    model: aircraft.type?.name ?? aircraft.type?.model ?? '',
    registration: aircraft.registrationDisplay,
    operator: aircraft.operator?.companyName ?? '',
    year: printed(specification.yearOfProduction),
    homeBase: homeBase?.icao ?? '',
    passengers: printed(specification.passengers),
  })
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '')

  /** The legacy opened this row on the second photograph, falling back to the first. */
  const [beside] = photographs.slice(1).concat(photographs)
  /** And stacked every one of them beside the figures, newest first. */
  const stacked = [...photographs].reverse()

  // The aircraft itself, catalogued (#173). No price: the page asks for the leg instead of
  // quoting one, exactly as the legacy detail page did.
  const catalogued = product(origin, locale as Locale, {
    slug: `aircraft/${id}`,
    name,
    description: aircraft.description,
    images: photographs.map((photo) => photo.src),
    brand: aircraft.type?.manufacturer,
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
              source={detailSource('aircraft', id)}
            />
          </div>
        </div>
      </section>
      {/* Full width, as the legacy drew it between the sections of this page. */}
      <Line />
      {/* The rich layout, which the legacy drew only for an aircraft that has photographs: the
          catalogue without them falls back to the `vehicles` row and a plainer page (#137). */}
      {photographs.length > 0 && (
        <>
          <section data-section="aircraft-specs">
            <div className="container gap-12">
              <div className="gap-10 md:grid md:grid-cols-2">
                {beside && (
                  <Image
                    alt={beside.alt === '' ? name : beside.alt}
                    className="rounded-3xl"
                    height={600}
                    src={beside.src}
                    width={600}
                  />
                )}
                <div className="top-hero-band gap-6 rounded-3xl border border-graphite-800 bg-graphite-950 p-6 py-10 pb-16 md:sticky md:gap-10 md:self-start md:p-10">
                  <h2>{name}</h2>
                  <div className="flex flex-col gap-4">
                    {paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </div>
              <div className="gap-10 md:grid md:grid-cols-2">
                {/* No rule after the last figure here, where the yacht card draws one
                    (`docs/legacy-inventory.md` section 4). */}
                <KeyStatsCard stats={stats} title={t('keyStats')} />
                <div className="gap-10">
                  {stacked.map((photo) => (
                    <Image
                      key={photo.src}
                      alt={photo.alt === '' ? name : photo.alt}
                      className="rounded-3xl border border-graphite-800 bg-graphite-950"
                      height={400}
                      sizes="(min-width: 768px) 45vw, 90vw"
                      src={photo.src}
                      width={600}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
          <Line />
        </>
      )}
      <JsonLd data={catalogued} />
      {trail && <JsonLd data={trail} />}
    </>
  )
}
