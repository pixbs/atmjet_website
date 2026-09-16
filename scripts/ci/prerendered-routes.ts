import {
  DYNAMIC_PAGE_SLUGS,
  PAGE_LOCALES,
  PAGE_SLUGS,
  pathForPage,
  type PageSlug,
} from '../../src/collections/Pages'
import { DEFAULT_LOCALES, type Locale } from '../../src/i18n/locales'
import { servedLocales } from '../../src/lib/pages'

/**
 * What a finished build must have prerendered (issue #178).
 *
 * The build reads the pages from the database, so a build against an empty one prerenders
 * nothing and still succeeds — an empty result is the legitimate answer for an environment with
 * no content yet (`listPageParams`). That is how CI came to build a site of zero pages for weeks
 * without anybody noticing (#252). This says out loud which routes a seeded build owes.
 */

/** Prerendered whatever the content holds, and both outside the locale segment. */
export const METADATA_ROUTES = ['/robots.txt', '/sitemap.xml'] as const

/**
 * Every page of the seeded site, in every language it serves. The slugs are the collection's own
 * list rather than a copy, so a route added there is expected here without anyone remembering to
 * add it. A page the build answers in one language only is expected in that one alone — the
 * routing decides which through the same `servedLocales` the pages themselves are built from —
 * and a listing served on demand is not expected at all, its sort and its page coming from the
 * query, so a build has nothing to prerender for it (issue #135).
 */
export function expectedRoutes(
  locales: readonly Locale[] = DEFAULT_LOCALES,
  slugs: readonly PageSlug[] = PAGE_SLUGS,
): string[] {
  const prerendered = slugs.filter((slug) => !DYNAMIC_PAGE_SLUGS.includes(slug))
  const pages = locales.flatMap((locale) =>
    prerendered
      .filter((slug) => servedLocales(PAGE_LOCALES[slug], locales).includes(locale))
      .map((slug) => pathForPage(locale, slug)),
  )

  return [...pages, ...METADATA_ROUTES]
}

/** The routes Next says it prerendered, from `.next/prerender-manifest.json`. */
export function routesFromManifest(manifest: unknown): string[] {
  const routes = (manifest as { routes?: Record<string, unknown> } | null)?.routes

  if (!routes || typeof routes !== 'object') {
    throw new Error('prerender-manifest.json has no routes: was the build run?')
  }

  return Object.keys(routes)
}

/** What the build owed and did not deliver, in the order they were expected. */
export function missingRoutes(
  expected: readonly string[],
  prerendered: readonly string[],
): string[] {
  const rendered = new Set(prerendered)

  return expected.filter((route) => !rendered.has(route))
}
