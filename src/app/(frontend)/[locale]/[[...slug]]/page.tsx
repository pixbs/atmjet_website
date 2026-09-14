import type { Metadata } from 'next'
import { notFound, permanentRedirect, redirect } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import React from 'react'

import { servedStatusFor } from '@/collections/Redirects'
import type { Locale } from '@/i18n/locales'
import { listPageParams } from '@/lib/data/pages'
import { getPayloadClient } from '@/lib/data/payload'
import { findRedirect } from '@/lib/data/redirects'
import { getEnabledLocales } from '@/lib/data/site-settings'
import { pageMetadata } from '@/lib/metadata'
import { siteOrigin } from '@/lib/urls'

/**
 * Renders a page document at `/<locale>/<slug>` (issue #60), with the locale root serving the
 * page whose slug is empty.
 *
 * An optional catch-all, so a purpose-built route added later for a database-driven listing
 * (the aircraft and yachts pages of E8) takes precedence over this one automatically. The
 * sections themselves arrive in E7; until then a page renders its title, which is what the
 * acceptance test checks reaches the browser in the server response.
 */
interface PageParams {
  locale: string
  slug?: string[]
}

/** The `plugin-seo` fields on a page; `image` is populated only when the read asks for depth. */
interface PageSeo {
  title?: string | null
  description?: string | null
  image?: string | number | { url?: string | null } | null
}

const slugFrom = (segments: string[] | undefined): string => (segments ?? []).join('/')

// `depth` is 1 only where the share image is read: a relationship the markup does not render
// costs a join on every request (docs/conventions/rendering.md).
async function findPage(locale: string, slug: string, depth = 0) {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    locale: locale as 'en',
    limit: 1,
    depth,
    // Drafts stay invisible here: this is a public read, so `publishedOnly` applies.
    overrideAccess: false,
  })

  return result.docs[0]
}

export async function generateStaticParams(): Promise<PageParams[]> {
  // Only the locales the site serves are prerendered, so enabling one in the admin adds its
  // pages and disabling one stops serving them, both without a deploy (issue #53).
  return listPageParams(await getEnabledLocales())
}

/**
 * What the page tells a crawler and a link preview (issue #170). The legacy site gave twelve of
 * its thirteen routes no metadata at all and none of them a canonical URL or an `hreflang` link
 * (`docs/legacy-inventory.md` section 2.4), so `/en/yachts` and `/ru/yachts` read as two
 * unrelated pages competing for the same content.
 *
 * The strings are the editor's, from the `plugin-seo` fields, falling back to the page title and
 * the site description rather than to nothing.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const [page, locales, t] = await Promise.all([
    findPage(locale, slugFrom(slug), 1),
    getEnabledLocales(),
    getTranslations({ locale, namespace: 'seo' }),
  ])

  // A path no page claims is a redirect or a 404; the layout's defaults are what it inherits.
  if (!page) return {}

  const meta = (page as { meta?: PageSeo }).meta

  return pageMetadata({
    locale: locale as Locale,
    locales,
    slug: slugFrom(slug),
    title: meta?.title || page.title,
    description: meta?.description || t('siteDescription'),
    image: typeof meta?.image === 'object' ? meta.image?.url : undefined,
    siteName: t('siteName'),
    origin: siteOrigin(),
  })
}

/**
 * Sends the visitor on if an editor has a redirect for this path, and 404s otherwise. Never
 * returns: both branches throw, which is how `redirect` and `notFound` work.
 *
 * The App Router can only emit 307 and 308, so a rule stored as 301 is served as 308 and one
 * stored as 302 or 303 as 307 (`servedStatusFor`, `src/collections/Redirects.ts`).
 */
async function redirectOrNotFound(locale: Locale, slug: string[] | undefined): Promise<never> {
  const match = await findRedirect(locale, `/${slugFrom(slug)}`)

  if (!match) notFound()

  if (servedStatusFor(match.status) === 308) permanentRedirect(match.destination)

  redirect(match.destination)
}

export default async function CatchAllPage({ params }: { params: Promise<PageParams> }) {
  const { locale, slug } = await params

  if (!(await getEnabledLocales()).includes(locale as Locale)) notFound()
  setRequestLocale(locale)

  const page = await findPage(locale, slugFrom(slug))

  // Only a request that would otherwise be a 404 pays for the redirect lookup (issue #69), so an
  // old URL keeps resolving without every other page reading the table. Returned rather than
  // awaited: the helper is typed `Promise<never>`, which narrows `page` only through a `return`.
  if (!page) return redirectOrNotFound(locale as Locale, slug)

  return (
    <article className="container gap-8 py-16">
      <h1>{page.title}</h1>
      {/* Sections render here from `page.layout` once the blocks of E7 exist. */}
    </article>
  )
}
