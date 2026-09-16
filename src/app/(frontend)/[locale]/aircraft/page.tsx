import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { RenderBlocks } from '@/blocks/render-blocks'
import { JsonLd } from '@/components/ui/json-ld'
import type { Locale } from '@/i18n/locales'
import { AIRCRAFT_LISTING } from '@/lib/aircraft'
import { findPageBySlug, pageHead } from '@/lib/data/pages'
import { getEnabledLocales } from '@/lib/data/site-settings'
import { parseListing, type SearchParams } from '@/lib/listing'
import { servedLocales } from '@/lib/pages'
import { breadcrumbs } from '@/lib/structured-data'
import { siteOrigin } from '@/lib/urls'

/**
 * The aircraft page (issue #135, `docs/legacy-inventory.md` section 4, route
 * `/[locale]/aircraft`).
 *
 * A route of its own rather than the catch-all, because the listing on it is sorted and read
 * through the URL and a query cannot be known before the request arrives: the page is rendered
 * on demand, and the twelve pages the catch-all serves stay prerendered
 * (`docs/conventions/rendering.md`). Its sections are still the blocks of the page document, in
 * the order an editor put them; this route only tells the listing among them what was asked for.
 */
const SLUG = 'aircraft'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  return pageHead(locale, SLUG)
}

export default async function AircraftPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<SearchParams>
}) {
  const { locale } = await params

  // A prefix that is not an enabled locale never reaches a page: the proxy stops routing it and
  // this is the second door, for a request that arrives at the route directly (issue #53).
  const locales = await getEnabledLocales()
  if (!locales.includes(locale as Locale)) notFound()

  setRequestLocale(locale)

  const page = await findPageBySlug(locale, SLUG)
  if (!page) notFound()

  // A page an editor serves in fewer languages sends the rest to the home page, as the catch-all
  // does for the pages it serves (issue #149).
  if (!servedLocales(page.availableLocales, locales).includes(locale as Locale))
    redirect(`/${locale}`)

  const t = await getTranslations({ locale, namespace: 'common' })
  // The trail a search result shows instead of a bare URL.
  const trail = breadcrumbs(siteOrigin(), locale as Locale, t('home'), {
    slug: SLUG,
    title: page.title,
  })

  return (
    <>
      <RenderBlocks
        layout={page.layout}
        listing={parseListing(await searchParams, AIRCRAFT_LISTING)}
        locale={locale as Locale}
      />
      {trail && <JsonLd data={trail} />}
    </>
  )
}
