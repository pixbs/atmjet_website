import type { Payload } from 'payload'

import type { Locale } from '@/i18n/locales'
import { servedLocales } from '@/lib/pages'
import type { Listable } from '@/lib/sitemap'

import { getPayloadClient } from './payload'

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
        select: { slug: true, availableLocales: true },
        overrideAccess: false,
      })

      for (const page of pages.docs) {
        // A page an editor has not given a slug to has no URL yet. Only a deliberate empty
        // string is the home page, so skipping these keeps such a draft from claiming the
        // locale root: Postgres counts NULLs as distinct, so the unique index allows many.
        if (typeof page.slug !== 'string') continue

        // A page this language is not served in has no URL here either: it redirects (#149).
        if (!servedLocales(page.availableLocales, locales).includes(locale)) continue

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
      select: { slug: true, updatedAt: true, availableLocales: true },
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
