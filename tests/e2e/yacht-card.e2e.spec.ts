import { expect, test } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The yachts for sale (issue #100, `docs/legacy-inventory.md` section 6): the photographs of one
 * listing in a carousel of their own, the counts beside them, the specifications under them, and
 * the cards themselves in a carousel that loops.
 */
const SECTION = '[data-section="yacht-cards"]'

test.describe('the sale yacht card', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(pathFor('/styleguide', 'en'))
    await page.locator(SECTION).scrollIntoViewIfNeeded()
  })

  test('is in the HTML the server sends, rows and all', async ({ request }) => {
    const html = await (await request.get(pathFor('/styleguide', 'en'))).text()

    expect(html).toContain('data-section="yacht-cards"')
    expect(html).toContain('Shipyard:')
    expect(html).toContain('Benetti')
    // The length is composed with its unit, as the legacy card composed it.
    expect(html).toContain('120 feet')
  })

  test('draws every row, even the ones a listing has nothing to say in', async ({ page }) => {
    // The second card carries a shipyard and nothing else; the ruled lines hold its height.
    const rows = page.locator(SECTION).locator('.min-w-80 > div')

    await expect(rows).toHaveCount(16)
  })

  test('moves between the photographs of one yacht', async ({ page }) => {
    const card = page.locator(SECTION).locator('.min-w-80').first()
    const dots = page.locator(SECTION).getByRole('tab')
    await expect(card).toBeVisible()

    await expect(dots.first()).toHaveAttribute('aria-selected', 'true')
    await page.locator(SECTION).getByRole('button', { name: 'Next photograph' }).first().click()

    await expect(dots.nth(1)).toHaveAttribute('aria-selected', 'true')
  })

  test('moves between the yachts, and loops back round', async ({ page }) => {
    const section = page.locator(SECTION)
    const cards = section.locator('.min-w-80')
    const first = await cards.first().boundingBox()

    await section.getByRole('button', { name: 'Next yacht' }).click()
    await expect.poll(async () => (await cards.first().boundingBox())?.x).not.toBe(first?.x)

    // The legacy carousel looped, so the arrow is never dead.
    await expect(section.getByRole('button', { name: 'Previous yacht' })).toBeEnabled()
  })
})
