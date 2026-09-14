import type { MetadataRoute } from 'next'

import { listPagesForSitemap } from '@/lib/data/pages'
import { getEnabledLocales } from '@/lib/data/site-settings'
import { pageEntries } from '@/lib/sitemap'
import { siteOrigin } from '@/lib/urls'

/**
 * `/sitemap.xml` (issue #171), built from the pages collection rather than written by hand, so
 * the `/citezens` typo and the missing `/sales_yachts` of `docs/legacy-inventory.md` section 2.3
 * cannot come back.
 *
 * Outside the route groups: a metadata file under `(frontend)` is shadowed by the `[locale]`
 * segment and answers 404. The locales are the ones `SiteSettings` enables (issue #53), so a
 * language nobody has turned on is never offered to a crawler.
 *
 * Prerendered with the pages it lists and dropped by the same `pages` tag when an editor
 * publishes (`docs/conventions/rendering.md`), so it never advertises a page they have taken
 * down.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [locales, pages] = await Promise.all([getEnabledLocales(), listPagesForSitemap()])

  return pageEntries(siteOrigin(), locales, pages)
}
