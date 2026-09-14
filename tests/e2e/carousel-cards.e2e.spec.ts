import { expect, test, type Page } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The two cards that are drawn to sit in the carousel (issues #105 and #99,
 * `docs/legacy-inventory.md` section 6): the key feature with its photograph and the aircraft
 * with its specifications. What is worth asserting is that they are on the page before any
 * script runs, that they behave as slides, and where the aircraft card leads.
 */
const features = (page: Page) => page.locator('[data-cards="key-feature"]')
const vehicles = (page: Page) => page.locator('[data-cards="vehicle"]')

test.describe('the key feature card', () => {
  test('is in the HTML the server sends', async ({ request }) => {
    // The legacy card was a client component; here only the carousel around it is.
    const html = await (await request.get(pathFor('/styleguide', 'en'))).text()

    expect(html).toContain('A flying intensive care unit')
    expect(html).toContain('An intensive care physician and a paramedic on every flight.')
  })

  test('draws its photograph behind the words', async ({ page }) => {
    await page.goto(pathFor('/styleguide', 'en'))
    const photo = features(page).locator('img').first()

    await photo.scrollIntoViewIfNeeded()
    await expect(photo).toHaveJSProperty('complete', true)
  })
})

test.describe('the vehicle card', () => {
  test('opens the aircraft page, whatever case the registration was stored in', async ({
    page,
  }) => {
    await page.goto(pathFor('/styleguide', 'en'))

    // The fixture stores the first one as `n-123ab`; the legacy link was `/aircraft/n-123ab`,
    // without a locale, so it answered only through a redirect (section 3.3).
    await expect(vehicles(page).getByRole('link', { name: /Gulfstream G650ER/ })).toHaveAttribute(
      'href',
      '/en/aircraft/N123AB',
    )
  })

  test('carries the locale of the page it is read on', async ({ page }) => {
    await page.goto(pathFor('/styleguide', 'ru'))

    await expect(
      vehicles(page).getByRole('link', { name: /Bombardier Global 7500/ }),
    ).toHaveAttribute('href', '/ru/aircraft/MYACHT')
  })

  test('keeps the rule under a specification the row has no value for', async ({ page }) => {
    await page.goto(pathFor('/styleguide', 'en'))
    const last = vehicles(page).getByRole('link').last()

    // The legacy card drew both ruled rows whether or not the column held anything.
    await expect(last.locator('div.border-b')).toHaveCount(2)
  })

  test('scrolls out of the way as a slide when the carousel moves on', async ({ page }) => {
    await page.goto(pathFor('/styleguide', 'en'))
    const first = vehicles(page).getByRole('link').first()
    await first.scrollIntoViewIfNeeded()
    const next = vehicles(page).getByRole('button', { name: 'Next aircraft' })
    await expect(next).toBeEnabled()

    const before = (await first.boundingBox())?.x ?? 0
    await next.click()

    await expect.poll(async () => (await first.boundingBox())?.x ?? 0).toBeLessThan(before)
  })
})
