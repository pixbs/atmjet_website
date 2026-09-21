import type { MetadataRoute } from 'next'

import { siteOrigin } from '@/lib/urls'

/**
 * `robots.txt` (issue #171). The legacy one disallowed `/private/`, a path that never existed,
 * and named `https://atmjet.com/sitemap.xml` in the source (`docs/legacy-inventory.md` section
 * 2.3), so every preview deployment advertised production's sitemap. The host comes from the
 * environment here, and the admin and the API stay out of the index.
 *
 * Every sitemap is named: the pages, and one catalogue each for the aircraft and the charter
 * fleet, whose detail pages a crawler would otherwise reach only through their listings.
 */
const SITEMAPS = ['/sitemap.xml', '/aircraft/sitemap.xml', '/yachts/sitemap.xml'] as const

export default function robots(): MetadataRoute.Robots {
  const origin = siteOrigin()

  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api'] },
    sitemap: SITEMAPS.map((path) => `${origin}${path}`),
  }
}
