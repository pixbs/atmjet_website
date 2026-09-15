import { expect, test } from '@playwright/test'

/**
 * The search behind the airport field (issue #159, `docs/legacy-inventory.md` section 8.5). The
 * field itself is covered by `autocomplete.e2e.spec.ts`; what is pinned here is the answer it
 * reads: the options, the order, and that a browser may keep them for a while.
 */
const SEARCH = '/api/airports/search'

test.describe('the airport search', () => {
  test('answers with the airports a term matches, busiest first', async ({ request }) => {
    const response = await request.get(`${SEARCH}?q=dub`)

    expect(response.ok()).toBe(true)
    expect(await response.json()).toEqual({
      options: [
        'Dubai (OMDB) United Arab Emirates, Dubai International',
        'Dubai (OMDW) United Arab Emirates, Al Maktoum',
      ],
    })
  })

  test('answers in the language it is asked in', async ({ request }) => {
    const response = await request.get(`${SEARCH}?q=dub&locale=ru`)

    expect((await response.json()).options[0]).toBe('Дубай (OMDB) ОАЭ, Дубай Интернешнл')
  })

  test('says nothing to a single letter, as the legacy search did', async ({ request }) => {
    expect(await (await request.get(`${SEARCH}?q=d`)).json()).toEqual({ options: [] })
    expect(await (await request.get(SEARCH)).json()).toEqual({ options: [] })
  })

  test('may be kept for a while: the table changes when an import runs', async ({ request }) => {
    const response = await request.get(`${SEARCH}?q=par`)

    expect(response.headers()['cache-control']).toContain('max-age=')
  })
})
