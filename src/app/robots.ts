import type { MetadataRoute } from 'next'

import { siteOrigin } from '@/lib/urls'

/**
 * `robots.txt` (issue #171). The legacy one disallowed `/private/`, a path that never existed,
 * and named `https://atmjet.com/sitemap.xml` in the source (`docs/legacy-inventory.md` section
 * 2.3), so every preview deployment advertised production's sitemap. The host comes from the
 * environment here, and the admin and the API stay out of the index.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api'] },
    sitemap: `${siteOrigin()}/sitemap.xml`,
  }
}
