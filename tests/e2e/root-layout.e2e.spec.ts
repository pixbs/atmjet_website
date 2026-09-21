import { expect, test, type APIRequestContext } from '@playwright/test'

import { ENABLED_LOCALES, pathFor } from './routes'

/**
 * What every page of the site inherits (issue #55, `docs/legacy-inventory.md` section 3.1): the
 * language it is written in, the icon a tab shows, the faces it is set in, and the two counters
 * the legacy layout carried.
 *
 * The legacy root layout lived under `[locale]` and called `headers()`, which made every route
 * dynamic; this one is a server component whose only client parts are the providers, so these
 * read the raw HTML wherever they can.
 */
const documentOf = async (request: APIRequestContext, path: string): Promise<string> => {
  const response = await request.get(path)

  expect(response.status(), path).toBe(200)

  return response.text()
}

test.describe('the shell every page inherits', () => {
  for (const locale of ENABLED_LOCALES) {
    test(`[${locale}] says which language it is written in`, async ({ request }) => {
      const html = await documentOf(request, pathFor('/', locale))

      expect(html).toMatch(new RegExp(`<html[^>]+lang="${locale}"`))
    })

    test(`[${locale}] names an icon a tab can draw`, async ({ request }) => {
      const html = await documentOf(request, pathFor('/', locale))
      const href = html.match(/<link[^>]+rel="icon"[^>]+href="([^"]*)"/)?.[1]

      expect(href, 'no icon link').toBeTruthy()

      // The legacy site served one by file convention and said nothing about it in the head.
      const icon = await request.get(String(href))

      expect(icon.status()).toBe(200)
      expect(icon.headers()['content-type']).toContain('image')
    })

    test(`[${locale}] preloads the faces it is set in`, async ({ request }) => {
      const html = await documentOf(request, pathFor('/', locale))

      // Both come through `next/font`, which self-hosts them under `_next/static/media` (#51).
      expect(html).toMatch(/<link[^>]+rel="preload"[^>]+as="font"/)
    })
  }

  test('counts a page view with the two the legacy layout carried', async ({ page }) => {
    await page.goto(pathFor('/', 'en'))
    await page.waitForLoadState('networkidle')

    const sources = await page.evaluate(() =>
      [...document.querySelectorAll('script[src]')].map((script) => script.getAttribute('src')),
    )

    // Client components, so they are absent from the server HTML and appear once hydrated.
    // Outside Vercel the two paths answer nothing, which is why this asks for the elements.
    expect(sources.some((src) => src?.includes('/_vercel/insights/'))).toBe(true)
    expect(sources.some((src) => src?.includes('/_vercel/speed-insights/'))).toBe(true)
  })
})
