import { expect, test, type APIRequestContext } from '@playwright/test'

import { ENABLED_LOCALES, pathFor, type Locale } from './routes'

/**
 * The head a crawler and a link preview read (issue #170). The legacy site shipped an empty
 * title on every route, metadata on one of thirteen, and no canonical or `hreflang` anywhere
 * (`docs/legacy-inventory.md` section 2.4). These assert what the server actually sends.
 */
const attribute = (html: string, pattern: RegExp): string | undefined => html.match(pattern)?.[1]

// Attribute names are matched case-insensitively: HTML does not distinguish, and React writes
// `hrefLang` into the markup it streams.
const metaContent = (html: string, property: string): string | undefined =>
  attribute(
    html,
    new RegExp(`<meta[^>]+(?:name|property)="${property}"[^>]+content="([^"]*)"`, 'i'),
  ) ??
  attribute(
    html,
    new RegExp(`<meta[^>]+content="([^"]*)"[^>]+(?:name|property)="${property}"`, 'i'),
  )

const linkHref = (html: string, rel: string): string | undefined =>
  attribute(html, new RegExp(`<link[^>]+rel="${rel}"[^>]+href="([^"]*)"`, 'i'))

const hreflang = (html: string, language: string): string | undefined =>
  attribute(html, new RegExp(`<link[^>]+hreflang="${language}"[^>]+href="([^"]*)"`, 'i')) ??
  attribute(html, new RegExp(`<link[^>]+href="([^"]*)"[^>]+hreflang="${language}"`, 'i'))

/**
 * The whole document, not the part before `</head>`: React streams metadata alongside the body
 * and the browser hoists it, so where in the response a tag lands is a timing detail. A crawler
 * parses the document, and so does this.
 */
async function documentOf(request: APIRequestContext, path: string): Promise<string> {
  const response = await request.get(path)

  expect(response.status(), path).toBe(200)

  return response.text()
}

test.describe('page metadata', () => {
  for (const locale of ENABLED_LOCALES) {
    test(`[${locale}] gives every page a title of its own`, async ({ request }) => {
      // The legacy layout computed a title and never returned it, so every page had an empty one.
      for (const slug of ['', 'empty_legs', 'sales_yachts']) {
        const head = await documentOf(request, pathFor(`/${slug}`, locale))
        const title = attribute(head, /<title>([^<]*)<\/title>/)

        expect(title, `${locale} /${slug}`).toBeTruthy()
        expect(title).not.toBe('ATM JET')
      }
    })

    test(`[${locale}] points at itself and lists its translations`, async ({ request }) => {
      const head = await documentOf(request, pathFor('/empty_legs', locale))
      const canonical = linkHref(head, 'canonical')

      expect(new URL(String(canonical)).pathname).toBe(`/${locale}/empty_legs`)

      for (const alternate of ENABLED_LOCALES) {
        expect(new URL(String(hreflang(head, alternate))).pathname).toBe(`/${alternate}/empty_legs`)
      }

      // A visitor whose language the site does not serve is sent to the canonical locale.
      expect(new URL(String(hreflang(head, 'x-default'))).pathname).toBe('/en/empty_legs')
    })

    test(`[${locale}] describes itself to a link preview`, async ({ request }) => {
      const head = await documentOf(request, pathFor('/yachts', locale))

      expect(metaContent(head, 'og:site_name')).toBe('ATM JET')
      expect(metaContent(head, 'og:type')).toBe('website')
      expect(new URL(String(metaContent(head, 'og:url'))).pathname).toBe(`/${locale}/yachts`)
      expect(metaContent(head, 'og:title')).toBeTruthy()
      expect(metaContent(head, 'og:description')).toBeTruthy()
      expect(metaContent(head, 'twitter:card')).toBeTruthy()
    })

    test(`[${locale}] names the language it is written in`, async ({ request }) => {
      const head = await documentOf(request, pathFor('/', locale))
      const expected: Record<Locale, string> = { en: 'en_US', ru: 'ru_RU', uk: 'uk_UA' }

      expect(metaContent(head, 'og:locale')).toBe(expected[locale])
    })
  }

  test('carries the title and description the legacy home page intended', async ({ request }) => {
    // The one route the legacy site gave metadata to; the strings are seeded with the page.
    const english = await documentOf(request, pathFor('/', 'en'))
    const russian = await documentOf(request, pathFor('/', 'ru'))

    expect(attribute(english, /<title>([^<]*)<\/title>/)).toBe(
      'Private Jet Charter, Hire a Private Jet Worldwide',
    )
    expect(metaContent(english, 'description')).toContain('Hire a private jet within a few hours')
    expect(attribute(russian, /<title>([^<]*)<\/title>/)).toContain('Аренда частного самолета')
    expect(metaContent(russian, 'description')).toContain('Арендовать частный самолет')
  })

  test('falls back to the page title and the site description, not to nothing', async ({
    request,
  }) => {
    // Only the home page was seeded with meta fields; the rest inherit rather than ship empty.
    const head = await documentOf(request, pathFor('/partners', 'en'))

    expect(attribute(head, /<title>([^<]*)<\/title>/)).toBe('Partners')
    expect(metaContent(head, 'description')).toContain('ATM JET')
  })

  test('names the film the home page opens on, as the legacy home page did', async ({
    request,
  }) => {
    const head = await documentOf(request, pathFor('/', 'en'))
    const video = metaContent(head, 'og:video')

    // An absolute URL, because a scraper reads the tag away from the page it came from: the
    // legacy path resolved against the page it was written on (section 13, entry 13).
    expect(video).toMatch(/^https?:\/\/.+\.mp4$/)
    expect(metaContent(head, 'og:video:type')).toBe('video/mp4')

    // The same file the hero itself plays, rather than a second copy of the path.
    expect(head).toContain(`<source src="${new URL(String(video)).pathname}"`)
  })

  test('names no film on a page that opens on none', async ({ request }) => {
    const head = await documentOf(request, pathFor('/partners', 'en'))

    expect(metaContent(head, 'og:video')).toBeUndefined()
  })
})

/**
 * The alternates a crawler is offered (issue #168), on the three kinds of route the site has:
 * a page of the content collection, a listing rendered on demand, and a detail page of a
 * catalogue. The legacy site had none of them anywhere (`docs/legacy-inventory.md` section 2.4).
 */
test.describe('hreflang', () => {
  /** A seeded charter yacht, as the detail specs name her. */
  const DETAIL_PAGE = '/yachts/azimut-serenity'

  for (const locale of ENABLED_LOCALES) {
    test(`[${locale}] a listing points at itself and lists its translations`, async ({
      request,
    }) => {
      const head = await documentOf(request, pathFor('/aircraft', locale))

      expect(new URL(String(linkHref(head, 'canonical'))).pathname).toBe(`/${locale}/aircraft`)
      for (const alternate of ENABLED_LOCALES) {
        expect(new URL(String(hreflang(head, alternate))).pathname).toBe(`/${alternate}/aircraft`)
      }
      expect(new URL(String(hreflang(head, 'x-default'))).pathname).toBe('/en/aircraft')
    })

    test(`[${locale}] a detail page points at itself and lists its translations`, async ({
      request,
    }) => {
      const head = await documentOf(request, pathFor(DETAIL_PAGE, locale))

      expect(new URL(String(linkHref(head, 'canonical'))).pathname).toBe(`/${locale}${DETAIL_PAGE}`)
      for (const alternate of ENABLED_LOCALES) {
        expect(new URL(String(hreflang(head, alternate))).pathname).toBe(
          `/${alternate}${DETAIL_PAGE}`,
        )
      }
      expect(new URL(String(hreflang(head, 'x-default'))).pathname).toBe(`/en${DETAIL_PAGE}`)
    })
  }

  test('offers a page served in one language no alternate it would be redirected from', async ({
    request,
  }) => {
    const head = await documentOf(request, pathFor('/citizens', 'ru'))

    expect(new URL(String(hreflang(head, 'ru'))).pathname).toBe('/ru/citizens')
    // `/en/citizens` answers 307, so offering it as the English version sends a crawler nowhere.
    expect(hreflang(head, 'en')).toBeUndefined()
    expect(new URL(String(hreflang(head, 'x-default'))).pathname).toBe('/ru/citizens')
  })

  test('answers with one set of alternates, not two', async ({ request }) => {
    // next-intl's proxy offers the same thing as a `Link` header, but knows only the routing: it
    // named an unprefixed `x-default` and an English citizens page that redirects, both
    // contradicting the document. The pages are the single answer now (issue #168).
    for (const path of ['/empty_legs', '/aircraft', '/citizens']) {
      const response = await request.get(pathFor(path, 'ru'), { maxRedirects: 0 })
      const links = response
        .headersArray()
        .filter((header) => header.name.toLowerCase() === 'link')
        .map((header) => header.value)
        .join(', ')

      expect(links, path).not.toContain('hreflang')
    }
  })
})
