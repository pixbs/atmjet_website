import type { MetadataRoute } from 'next'

import { getEnabledLocales } from '@/lib/data/site-settings'
import { listCharterYachtsForSitemap } from '@/lib/data/yachts'
import { detailEntries } from '@/lib/sitemap'
import { siteOrigin } from '@/lib/urls'

/**
 * `/yachts/sitemap.xml` (issue #171). The legacy site offered a crawler nothing about the
 * charter fleet at all (`docs/legacy-inventory.md` section 2.3), so its detail pages were
 * reachable only by following the listing.
 *
 * Outside the route groups, as `/sitemap.xml` is: a metadata file under `(frontend)` is
 * shadowed by the `[locale]` segment and answers 404.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [locales, yachts] = await Promise.all([getEnabledLocales(), listCharterYachtsForSitemap()])

  return detailEntries(siteOrigin(), locales, 'yachts', yachts)
}
