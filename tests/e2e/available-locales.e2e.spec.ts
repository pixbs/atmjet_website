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

    expect(response.status()).toBe(307)
    expect(response.headers()['location']).toBe(pathFor('/', 'en'))
  })

  test('is offered to a crawler at the URL it answers on, and at no other', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text()
    const entry = xml.split('<url>').find((block) => block.includes('citizens')) ?? ''

    expect(entry).toContain(`${pathFor('/citizens', 'ru')}</loc>`)
    expect(entry).not.toContain(pathFor('/citizens', 'en'))
  })
})
