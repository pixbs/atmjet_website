import { expect, test } from '@playwright/test'

import { pathFor } from './routes'

/**
 * A page an editor serves in fewer languages than the site (issue #149,
 * `docs/legacy-inventory.md` section 4). The legacy citizens page was Russian only and said so
 * by calling `redirect('/')` from inside its own component (section 13, entry 78, `keep`); it
 * is a field now, and the page it is set on is the one the legacy set it on.
 */
test.describe('a page served in one language', () => {
  test('answers in the language it is served in', async ({ request }) => {
    const response = await request.get(pathFor('/citizens', 'ru'))

    expect(response.status()).toBe(200)
  })

  test('sends the other languages to the home page, not to a 404', async ({ request }) => {
    // The legacy sent them to `/`, which its middleware then resolved to their own language;
    // this sends them straight there.
    const response = await request.get(pathFor('/citizens', 'en'), { maxRedirects: 0 })
    // Named in both assertions, so a failing run reports what actually came back (issue #364).
    const received = JSON.stringify(response.headersArray())

    // A 404 would mean the page was not found rather than not served in this language, and a
    // 200 that the `availableLocales` check never fired; both are read off the status.
    expect(response.status(), received).toBe(307)

    // Read off the array rather than the joined map: Next sends `Location` twice on the request
    // that populates this redirect's cache entry, and `headers()` joins the two into
    // `"/en, /en"` (issue #364). Where the visitor is sent is what this page owes, and every
    // copy of the header has to name the same destination.
    const destinations = new Set(
      response
        .headersArray()
        .filter((header) => header.name.toLowerCase() === 'location')
        .map((header) => header.value),
    )

    expect([...destinations], received).toEqual([pathFor('/', 'en')])
  })

  test('is offered to a crawler at the URL it answers on, and at no other', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text()
    const entry = xml.split('<url>').find((block) => block.includes('citizens')) ?? ''

    expect(entry).toContain(`${pathFor('/citizens', 'ru')}</loc>`)
    expect(entry).not.toContain(pathFor('/citizens', 'en'))
  })
})
