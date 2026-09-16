import type { Metadata } from 'next'
import { notFound, permanentRedirect, redirect } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import React from 'react'

import { RenderBlocks } from '@/blocks/render-blocks'
import { servedStatusFor } from '@/collections/Redirects'
import { AngleBar } from '@/components/sections/angle-bar'
import { JsonLd } from '@/components/ui/json-ld'
import type { Locale } from '@/i18n/locales'
import { findPageBySlug, listPageParams, pageHead } from '@/lib/data/pages'
import { findRedirect } from '@/lib/data/redirects'
import { getEnabledLocales } from '@/lib/data/site-settings'
import { breadcrumbs, faqPage } from '@/lib/structured-data'
import { siteOrigin } from '@/lib/urls'

/**
 * Renders a page document at `/<locale>/<slug>` (issue #60), with the locale root serving the
 * page whose slug is empty.
 *
 * An optional catch-all, so a purpose-built route added later for a database-driven listing
 * (the aircraft and yachts pages of E8) takes precedence over this one automatically. The
 * sections are the blocks of the page's layout (E7), rendered in the order an editor put them;
 * a page with none renders its title alone, which is what it did before the blocks existed.
 */
interface PageParams {
  locale: string
  slug?: string[]
}

const slugFrom = (segments: string[] | undefined): string => (segments ?? []).join('/')

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

  return pageHead(locale, slugFrom(slug))
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

  // A prefix that is not an enabled locale never reaches a page: the proxy stops routing it and
  // this is the second door, for a request that arrives at the route directly (issue #53).
  const locales = await getEnabledLocales()
  if (!locales.includes(locale as Locale)) notFound()

  setRequestLocale(locale)

  const page = await findPageBySlug(locale, slugFrom(slug))

  // Only a request that would otherwise be a 404 pays for the redirect lookup (issue #69), so an
  // old URL keeps resolving without every other page reading the table. Returned rather than
  // awaited: the helper is typed `Promise<never>`, which narrows `page` only through a `return`.
  if (!page) return redirectOrNotFound(locale as Locale, slug)

  const t = await getTranslations({ locale, namespace: 'common' })
  // The trail a search result shows instead of a bare URL; the home page is not its own trail.
  const trail = breadcrumbs(siteOrigin(), locale as Locale, t('home'), {
    slug: slugFrom(slug),
    title: page.title,
  })

  // Every question the page asks, wherever in the layout it asks it (issue #173).
  const questions = (page.layout ?? []).flatMap((block) =>
    block.blockType === 'faq' ? (block.questions ?? []) : [],
  )
  const answered = faqPage(questions)

  return (
    <>
      {(page.layout ?? []).length === 0 ? (
        // A page whose sections have not been ported yet renders its title, as it did before
        // any block existed (issue #60).
        <article className="container gap-8 py-16">
          <h1>{page.title}</h1>
        </article>
      ) : (
        <RenderBlocks layout={page.layout} locale={locale as Locale} />
      )}
      {/* The floating button the legacy site drew on the home page and nowhere else
          (`docs/legacy-inventory.md` section 3.5, issue #94). */}
      {slugFrom(slug) === '' && <AngleBar locale={locale as Locale} locales={locales} />}
      {trail && <JsonLd data={trail} />}
      {answered && <JsonLd data={answered} />}
    </>
  )
}
