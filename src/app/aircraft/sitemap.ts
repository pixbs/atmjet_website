import type { MetadataRoute } from 'next'

import { listAircraftForSitemap } from '@/lib/data/aircraft'
import { getEnabledLocales } from '@/lib/data/site-settings'
import { detailEntries } from '@/lib/sitemap'
import { siteOrigin } from '@/lib/urls'

/**
 * `/aircraft/sitemap.xml` (issue #171), the path the legacy site served its aircraft sitemap at
 * and kept so a crawler that knows it is not sent to a 404. What it lists has changed: the
 * legacy file enumerated the `vehicles` table into unprefixed URLs that answer only through a
 * redirect (`docs/legacy-inventory.md` section 2.3), and these are the catalogue's own,
 * locale-prefixed addresses.
 *
 * Outside the route groups, as `/sitemap.xml` is: a metadata file under `(frontend)` is
 * shadowed by the `[locale]` segment and answers 404.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [locales, aircraft] = await Promise.all([getEnabledLocales(), listAircraftForSitemap()])

  return detailEntries(siteOrigin(), locales, 'aircraft', aircraft)
}
