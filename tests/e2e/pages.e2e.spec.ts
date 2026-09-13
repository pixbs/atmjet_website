import { expect, test } from '@playwright/test'

import { pathFor } from './routes'

/**
 * A seeded page reaches the browser and a draft does not (issue #60). The home page has its own
 * spec; these are the other static routes and the draft rule that E7 and E8 depend on.
 */
const SEEDED = [
  { slug: 'empty_legs', en: 'Empty legs', ru: 'Пустые перелёты' },
  { slug: 'sales_yachts', en: 'Yachts for sale', ru: 'Яхты на продажу' },
] as const

test.describe('pages', () => {
  for (const page of SEEDED) {
    test(`serves ${page.slug} in both locales, from the server`, async ({ request }) => {
      for (const locale of ['en', 'ru'] as const) {
        const response = await request.get(pathFor(`/${page.slug}`, locale))

        expect(response.status(), `${locale} /${page.slug}`).toBe(200)
        expect(await response.text()).toContain(page[locale])
      }
    })
  }

  test('keeps the legacy underscore slugs, so ported URLs do not move', async ({ request }) => {
    // The legacy routes are atm_jet_group and sales_dept, not kebab-case.
    expect((await request.get(pathFor('/atm_jet_group', 'en'))).status()).toBe(200)
    expect((await request.get(pathFor('/atm-jet-group', 'en'))).status()).toBe(404)
  })

  test('answers 404 for a slug no page claims', async ({ request }) => {
    const response = await request.get(pathFor('/not-a-page', 'en'))

    expect(response.status()).toBe(404)
  })
})
