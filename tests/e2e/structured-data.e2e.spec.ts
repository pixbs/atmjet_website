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

  test('carries the questions a page answers, with its answers', async ({ request }) => {
    const graph = await graphOf(request, pathFor('/', 'en'))
    const questions = graph.FAQPage.mainEntity as Array<Record<string, unknown>>

    expect(questions.length).toBeGreaterThan(0)
    for (const question of questions) {
      expect(question['@type']).toBe('Question')
      expect(String(question.name).length).toBeGreaterThan(0)
      expect(question.acceptedAnswer).toMatchObject({
        '@type': 'Answer',
        text: expect.stringMatching(/\S/),
      })
    }

    // The same questions the section itself draws.
    const html = await (await request.get(pathFor('/', 'en'))).text()
    expect(html).toContain(String(questions[0].name))
  })

  test('says nothing about questions on a page that asks none', async ({ request }) => {
    expect(await graphOf(request, pathFor('/partners', 'en'))).not.toHaveProperty('FAQPage')
  })
})

/**
 * The detail pages of the two catalogues (issue #173). A listing card is a link in a result;
 * these are what let a result carry the photograph, the maker and the price instead.
 */
test.describe('a page that shows one of something', () => {
  /** Seeded fixtures, as the detail specs name them: a yacht with a price, an aircraft without. */
  const YACHT = '/yachts/azimut-serenity'
  const AIRCRAFT = '/aircraft/MOUSE'

  test('describes the yacht it is showing, with the hour she is quoted by', async ({ request }) => {
    const graph = await graphOf(request, pathFor(YACHT, 'en'))

    expect(graph.Product).toMatchObject({
      '@context': 'https://schema.org',
      name: expect.stringContaining('Serenity'),
      url: expect.stringContaining(`/en${YACHT}`),
      brand: { '@type': 'Brand', name: 'Azimut' },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'AED',
        // Said rather than left for a reader to take as a total; HUR is an hour.
        priceSpecification: { unitCode: 'HUR', price: expect.any(Number) },
      },
    })
  })

  test('gives every photograph an address a crawler can fetch', async ({ request }) => {
    const graph = await graphOf(request, pathFor(YACHT, 'en'))
    const images = graph.Product.image as string[]

    expect(images.length).toBeGreaterThan(0)
    for (const image of images) {
      // An upload Payload serves itself is asked of the deployment under test, whatever origin
      // the page names; one in the bucket is asked of the bucket (#20).
      const url = new URL(image)
      const response = await request.get(
        url.pathname.startsWith('/api/media/') ? url.pathname : image,
      )

      expect(response.status(), image).toBe(200)
    }
  })

  test('describes the aircraft it is showing, and quotes no price for it', async ({ request }) => {
    const graph = await graphOf(request, pathFor(AIRCRAFT, 'en'))

    expect(graph.Product).toMatchObject({ name: expect.stringMatching(/\S/) })
    // The page asks for the leg instead of naming a figure, as the legacy page did.
    expect(graph.Product.offers).toBeUndefined()
  })

  test('names the same page its canonical does, in the language being read', async ({
    request,
  }) => {
    for (const locale of ENABLED_LOCALES) {
      const graph = await graphOf(request, pathFor(YACHT, locale))

      expect(new URL(String(graph.Product.url)).pathname, locale).toBe(`/${locale}${YACHT}`)
    }
  })
})
