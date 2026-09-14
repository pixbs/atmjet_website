import { PAGE_SLUGS, pathForPage } from '../../src/collections/Pages'
import { DEFAULT_LOCALES, type Locale } from '../../src/i18n/locales'

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
 * add it.
 */
export function expectedRoutes(
  locales: readonly Locale[] = DEFAULT_LOCALES,
  slugs: readonly string[] = PAGE_SLUGS,
): string[] {
  const pages = locales.flatMap((locale) => slugs.map((slug) => pathForPage(locale, slug)))

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
