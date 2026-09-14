import { expect, test, type APIRequestContext } from '@playwright/test'

import { ENABLED_LOCALES, pathFor } from './routes'

/**
 * The structured data a search engine reads (issue #173). The legacy site emitted none, so these
 * assert that what the server sends parses, and says what it is supposed to say.
 */
const BLOCK = /<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs

async function graphOf(
  request: APIRequestContext,
  path: string,
): Promise<Record<string, Record<string, unknown>>> {
  const response = await request.get(path)

  expect(response.status(), path).toBe(200)

  const html = await response.text()
  const blocks = [...html.matchAll(BLOCK)].map(
    ([, json]) => JSON.parse(json) as Record<string, unknown>,
  )

  return Object.fromEntries(blocks.map((block) => [String(block['@type']), block]))
}

test.describe('structured data', () => {
  for (const locale of ENABLED_LOCALES) {
    test(`[${locale}] names the company and how to reach it, on every page`, async ({
      request,
    }) => {
      for (const path of [pathFor('/', locale), pathFor('/partners', locale)]) {
        const graph = await graphOf(request, path)

        expect(graph.Organization, path).toMatchObject({
          '@context': 'https://schema.org',
          name: 'ATM JET',
          // The number an editor keeps in the site settings, in the form a phone can dial.
          telephone: expect.stringMatching(/^\+\d{8,}$/),
          email: expect.stringContaining('@'),
        })
      }
    })

    test(`[${locale}] says which site this is, in the language being read`, async ({ request }) => {
      const graph = await graphOf(request, pathFor('/', locale))

      expect(graph.WebSite).toMatchObject({ inLanguage: locale, name: 'ATM JET' })
      expect(new URL(String(graph.WebSite.url)).pathname).toBe(`/${locale}`)
      // Points at the organisation block rather than repeating it.
      expect(graph.WebSite.publisher).toEqual({ '@id': graph.Organization['@id'] })
    })
  }

  test('leads from the home page to the page being read', async ({ request }) => {
    const graph = await graphOf(request, pathFor('/empty_legs', 'en'))
    const trail = graph.BreadcrumbList.itemListElement as Array<Record<string, unknown>>

    expect(trail.map((step) => step.position)).toEqual([1, 2])
    expect(new URL(String(trail[1].item)).pathname).toBe('/en/empty_legs')
  })

  test('advertises no trail a visitor cannot follow', async ({ request }) => {
    const graph = await graphOf(request, pathFor('/empty_legs', 'en'))
    const trail = graph.BreadcrumbList.itemListElement as Array<Record<string, unknown>>

    for (const step of trail) {
      const response = await request.get(new URL(String(step.item)).pathname, { maxRedirects: 0 })

      expect(response.status(), String(step.item)).toBe(200)
    }
  })

  test('gives the home page no trail of its own', async ({ request }) => {
    // It is the first step of every other page's trail, not a trail with one step.
    expect(await graphOf(request, pathFor('/', 'en'))).not.toHaveProperty('BreadcrumbList')
  })
})
