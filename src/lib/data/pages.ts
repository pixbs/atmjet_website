import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import type { Payload } from 'payload'
import { cache } from 'react'

import { DYNAMIC_PAGE_SLUGS } from '@/collections/Pages'
import type { Locale } from '@/i18n/locales'
import { pageMetadata } from '@/lib/metadata'
import type { Listable } from '@/lib/sitemap'
import { siteOrigin } from '@/lib/urls'

import { getPayloadClient } from './payload'
import { getEnabledLocales } from './site-settings'

export interface PageRouteParams {
  locale: string
  /** Path segments after the locale. Empty for the home page. */
  slug?: string[]
}

/**
 * The slugs of the pages a menu points at, keyed by id (issues #88 and #89).
 *
 * Two queries rather than one `depth: 1` read of the global: the relationship resolves to whole
 * Page documents, and the chrome renders on every page of the site, so it asks for the dozen
 * slugs it needs instead of for a dozen pages with everything on them.
 */
export async function slugsByPageId(
  ids: readonly number[],
  // Injected so a caller can share one client, as the chrome readers do.
  client: () => Promise<Payload> = getPayloadClient,
): Promise<Map<number, string>> {
  if (ids.length === 0) return new Map()

  const payload = await client()
  const { docs } = await payload.find({
    collection: 'pages',
    where: { id: { in: [...ids] } },
    limit: 0,
    depth: 0,
    select: { slug: true },
    // Only what a visitor can read: a link to a draft page is a link to a 404.
    overrideAccess: false,
  })

  return new Map(
    docs.flatMap((page) => (typeof page.slug === 'string' ? [[page.id, page.slug] as const] : [])),
  )
}

/**
 * Every published page, as route params for `generateStaticParams`.
 *
 * Prerendering is an optimisation, not a correctness requirement, so a build that cannot reach
 * the content database still produces a deployable site: the pages render on demand instead.
 * Without this a preview whose database is not wired up yet (issue #34) fails the build
 * outright, which is how this was found.
 *
 * The failure is reported loudly rather than swallowed, because a production build that
 * prerenders nothing is worth noticing in the log.
 */
export async function listPageParams(
  locales: readonly Locale[],
  // Injected so the unreachable-database path can be tested without breaking the database.
  client: () => Promise<Payload> = getPayloadClient,
): Promise<PageRouteParams[]> {
  try {
    const payload = await client()
    const params: PageRouteParams[] = []

    for (const locale of locales) {
      const pages = await payload.find({
        collection: 'pages',
        locale,
        limit: 0,
        depth: 0,
        select: { slug: true },
        overrideAccess: false,
      })

      for (const page of pages.docs) {
        // A page an editor has not given a slug to has no URL yet. Only a deliberate empty
        // string is the home page, so skipping these keeps such a draft from claiming the
        // locale root: Postgres counts NULLs as distinct, so the unique index allows many.
        if (typeof page.slug !== 'string') continue

        // A listing is served by a route of its own and rendered on demand, so the catch-all
        // has nothing to prerender for it (issue #135).
        if (DYNAMIC_PAGE_SLUGS.some((dynamic) => dynamic === page.slug)) continue

        params.push({ locale, slug: page.slug === '' ? [] : page.slug.split('/') })
      }
    }

    return params
  } catch (error) {
    console.warn(
      '[pages] prerendering skipped: the content database was unreachable at build time, so pages will render on demand.',
      error,
    )
    return []
  }
}

/**
 * Every published page as a sitemap row (issue #171): the slug it is served at and when an
 * editor last changed it.
 *
 * One query for all locales, unlike `listPageParams`: the slug is not localized and neither is
 * `updatedAt`, so a page is the same row in every language and the sitemap says so with
 * `alternates` instead of repeating it.
 *
 * A sitemap is built with the pages, so it gets the same treatment as prerendering: a build that
 * cannot reach the database serves an empty sitemap rather than failing. An empty sitemap is a
 * deployable site; a failed build is not.
 */
export async function listPagesForSitemap(
  // Injected so the unreachable-database path can be tested without breaking the database.
  client: () => Promise<Payload> = getPayloadClient,
): Promise<Listable[]> {
  try {
    const payload = await client()
    const pages = await payload.find({
      collection: 'pages',
      limit: 0,
      depth: 0,
      select: { slug: true, updatedAt: true },
      // Only what a visitor can read: a draft page has no URL to offer a crawler.
      overrideAccess: false,
    })

    return pages.docs
  } catch (error) {
    console.warn(
      '[pages] the sitemap is empty: the content database was unreachable at build time.',
      error,
    )
    return []
  }
}

/**
 * The page served at a path, or nothing (issue #60).
 *
 * Read through `cache()`, so the two readers of one request — the head and the body of the page
 * — share a query rather than each making their own. `depth` is 1: the blocks of the layout draw
 * their own uploads and the head reads the share image off the same document
 * (`docs/conventions/rendering.md`).
 */
export const findPageBySlug = cache(async (locale: string, slug: string) => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    locale: locale as 'en',
    limit: 1,
    depth: 1,
    // Drafts stay invisible here: this is a public read, so `publishedOnly` applies.
    overrideAccess: false,
  })

  return result.docs[0]
})

/** The `plugin-seo` fields on a page; `image` is the document, not its id, at this depth. */
interface PageSeo {
  title?: string | null
  description?: string | null
  image?: string | number | { url?: string | null } | null
}

/**
 * What a page tells a crawler and a link preview (issue #170). The legacy site gave twelve of
 * its thirteen routes no metadata at all and none of them a canonical URL or an `hreflang` link
 * (`docs/legacy-inventory.md` section 2.4), so `/en/yachts` and `/ru/yachts` read as two
 * unrelated pages competing for the same content.
 *
 * The strings are the editor's, from the `plugin-seo` fields, falling back to the page title and
 * the site description rather than to nothing. A path no page claims is a redirect or a 404, and
 * inherits the layout's defaults.
 */
export async function pageHead(locale: string, slug: string): Promise<Metadata> {
  const [page, locales, t] = await Promise.all([
    findPageBySlug(locale, slug),
    getEnabledLocales(),
    getTranslations({ locale, namespace: 'seo' }),
  ])

  if (!page) return {}

  const meta = (page as { meta?: PageSeo }).meta
  // The film the page opens on, which is what the legacy home page named to a scraper
  // (`docs/legacy-inventory.md` section 2.4). A page without a hero video names none.
  const hero = (page.layout ?? []).find((block) => block.blockType === 'heroVideo')

  return pageMetadata({
    locale: locale as Locale,
    locales,
    slug,
    title: meta?.title || page.title,
    description: meta?.description || t('siteDescription'),
    image: typeof meta?.image === 'object' ? meta.image?.url : undefined,
    video: hero ? new URL(hero.video, siteOrigin()).href : undefined,
    siteName: t('siteName'),
    origin: siteOrigin(),
  })
}
