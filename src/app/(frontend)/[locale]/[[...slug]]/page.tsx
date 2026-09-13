import type { Metadata } from 'next'
import { notFound, permanentRedirect, redirect } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import React from 'react'

import { servedStatusFor } from '@/collections/Redirects'
import type { Locale } from '@/i18n/locales'
import { listPageParams } from '@/lib/data/pages'
import { getPayloadClient } from '@/lib/data/payload'
import { findRedirect } from '@/lib/data/redirects'
import { getEnabledLocales } from '@/lib/data/site-settings'

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

const slugFrom = (segments: string[] | undefined): string => (segments ?? []).join('/')

async function findPage(locale: string, slug: string) {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    locale: locale as 'en',
    limit: 1,
    depth: 0,
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

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const page = await findPage(locale, slugFrom(slug))

  if (!page) return {}

  const meta = (page as { meta?: { title?: string | null; description?: string | null } }).meta

  return {
    title: meta?.title || page.title,
    description: meta?.description ?? undefined,
  }
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
