import { expect, test, type APIRequestContext } from '@playwright/test'

import { ENABLED_LOCALES, LOCALES } from './routes'

/**
 * What a crawler is told (issue #171). The legacy `/sitemap.xml` was a written list that
 * advertised `/citezens`, left `/sales_yachts` out and pointed at unprefixed URLs that only
 * answer with a redirect (`docs/legacy-inventory.md` section 2.3). These assert what the
 * deployed site now serves at those two paths.
 */
const locationsIn = (xml: string): string[] =>
  [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url)

const alternatesFor = (xml: string, url: string): Record<string, string> => {
  const entry = xml.split('<url>').find((block) => block.includes(`<loc>${url}</loc>`)) ?? ''
  const links = entry.matchAll(/hreflang="([^"]+)"\s+href="([^"]+)"/g)

  return Object.fromEntries([...links].map(([, language, href]) => [language, href]))
}

/** The pages a visitor can open, counted through the API the sitemap is built from. */
async function publishedPageCount(request: APIRequestContext): Promise<number> {
  const response = await request.get('/api/pages?limit=0&depth=0&select[slug]=true')

  expect(response.status()).toBe(200)

  const { docs } = (await response.json()) as { docs: Array<{ slug?: string | null }> }

  return docs.filter((page) => typeof page.slug === 'string').length
}

async function sitemapXml(request: APIRequestContext, path = '/sitemap.xml'): Promise<string> {
  const response = await request.get(path)

  expect(response.status(), path).toBe(200)
  expect(response.headers()['content-type']).toContain('xml')

  return response.text()
}

test.describe('sitemap.xml', () => {
  test('lists every published page once, and nothing else', async ({ request }) => {
    const locations = locationsIn(await sitemapXml(request))

    expect(locations.length).toBe(await publishedPageCount(request))
    expect(new Set(locations).size).toBe(locations.length)
  })

  test('offers each page in every served locale, with x-default', async ({ request }) => {
    const xml = await sitemapXml(request)
    const [first] = locationsIn(xml)
    const alternates = alternatesFor(xml, first)

    // The legacy entries carried ru and en alternates but no x-default, so a crawler matching
    // neither language had nothing to fall back to.
    expect(Object.keys(alternates).sort()).toEqual([...ENABLED_LOCALES, 'x-default'].sort())
    expect(alternates['x-default']).toBe(first)
  })

  test('says nothing about a locale the site does not serve', async ({ request }) => {
    const hidden = LOCALES.filter((locale) => !ENABLED_LOCALES.includes(locale))
    const xml = await sitemapXml(request)
    const paths = locationsIn(xml).map((url) => new URL(url).pathname)

    for (const locale of hidden) {
      // `uk` is a locale editors write in but nobody has enabled (issue #53), and an unreachable
      // URL is worse in a sitemap than absent.
      expect(xml, `hreflang ${locale}`).not.toContain(`hreflang="${locale}"`)
      expect(
        paths.some((path) => path.startsWith(`/${locale}`)),
        locale,
      ).toBe(false)
    }
  })

  test('names one host, and prefixes every URL with a locale', async ({ request }) => {
    const locations = locationsIn(await sitemapXml(request))
    const origins = new Set(locations.map((url) => new URL(url).origin))

    expect(origins.size).toBe(1)
    for (const url of locations) {
      expect(new URL(url).pathname).toMatch(new RegExp(`^/(${ENABLED_LOCALES.join('|')})(/|$)`))
    }
  })

  test('lists the pages the legacy sitemap got wrong', async ({ request }) => {
    const paths = locationsIn(await sitemapXml(request)).map((url) => new URL(url).pathname)

    expect(paths).toContain('/ru/citizens')
    expect(paths).not.toContain('/ru/citezens')
    expect(paths).toContain('/en/sales_yachts')
  })

  test('advertises no URL that answers with a redirect or a 404', async ({ request }) => {
    const paths = locationsIn(await sitemapXml(request)).map((url) => new URL(url).pathname)

    for (const path of paths) {
      const response = await request.get(path, { maxRedirects: 0 })

      expect(response.status(), path).toBe(200)
    }
  })
})

/**
 * The catalogues (issue #171): the aircraft sitemap at the path the legacy site used, and one
 * for the charter fleet, which the legacy site never offered at all.
 */
const CATALOGUES = [
  { path: '/aircraft/sitemap.xml', listing: 'aircraft' },
  { path: '/yachts/sitemap.xml', listing: 'yachts' },
] as const

for (const { path, listing } of CATALOGUES) {
  test.describe(path, () => {
    test('lists the detail pages of its catalogue, once each', async ({ request }) => {
      const locations = locationsIn(await sitemapXml(request, path))

      expect(locations.length).toBeGreaterThan(0)
      expect(new Set(locations).size).toBe(locations.length)
      for (const url of locations) {
        // The legacy aircraft sitemap listed unprefixed URLs that answer with a redirect.
        expect(new URL(url).pathname).toMatch(
          new RegExp(`^/(${ENABLED_LOCALES.join('|')})/${listing}/.+`),
        )
      }
    })

    test('offers each page in every served locale, with x-default', async ({ request }) => {
      const xml = await sitemapXml(request, path)
      const [first] = locationsIn(xml)

      expect(Object.keys(alternatesFor(xml, first)).sort()).toEqual(
        [...ENABLED_LOCALES, 'x-default'].sort(),
      )
    })

    test('advertises no URL that answers with a redirect or a 404', async ({ request }) => {
      const paths = locationsIn(await sitemapXml(request, path)).map((url) => new URL(url).pathname)

      for (const url of paths) {
        const response = await request.get(url, { maxRedirects: 0 })

        expect(response.status(), url).toBe(200)
      }
    })

    test('names the same host the pages sitemap does', async ({ request }) => {
      const [listed] = locationsIn(await sitemapXml(request, path))
      const [page] = locationsIn(await sitemapXml(request))

      expect(new URL(listed).origin).toBe(new URL(page).origin)
    })
  })
}

test.describe('robots.txt', () => {
  test('points a crawler at every sitemap, on the host the sitemaps name', async ({ request }) => {
    const response = await request.get('/robots.txt')

    expect(response.status()).toBe(200)

    const body = await response.text()
    const sitemaps = [...body.matchAll(/Sitemap:\s*(\S+)/g)].map(([, url]) => url)
    const [listed] = locationsIn(await sitemapXml(request))

    // The legacy robots.txt named atmjet.com from the source while the sitemap built its URLs
    // from the deployment, so a preview sent crawlers to production.
    expect(sitemaps.map((url) => new URL(url).pathname)).toEqual([
      '/sitemap.xml',
      ...CATALOGUES.map(({ path }) => path),
    ])
    for (const url of sitemaps) {
      expect(new URL(url).origin).toBe(new URL(listed).origin)
    }
  })

  test('keeps the admin and the API out of the index', async ({ request }) => {
    const body = await (await request.get('/robots.txt')).text()

    expect(body).toContain('Disallow: /admin')
    expect(body).toContain('Disallow: /api')
    // `/private/` never existed on the legacy site.
    expect(body).not.toContain('/private')
  })
})
