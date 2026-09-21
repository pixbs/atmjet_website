import { expect, test } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The recent yachts (issue #133, `docs/legacy-inventory.md` section 4): the heading over the
 * yachts for sale, one card at a time, in the card the legacy page drew round them.
 */
const SECTION = '[data-section="recent-yachts"]'

test.describe('the recent yachts', () => {
  test('is in the HTML the server sends, with the listings in it', async ({ request }) => {
    const html = await (await request.get(pathFor('/sales_yachts', 'en'))).text()

    expect(html).toContain('data-section="recent-yachts"')
    expect(html).toContain('Recently bought yachts for ourselves')
    expect(html).toContain('Benetti')
    // The length is composed with its unit, as the legacy card composed it.
    expect(html).toContain('120 feet')
  })

  test('names the rows in the language of the page', async ({ request }) => {
    const html = await (await request.get(pathFor('/sales_yachts', 'ru'))).text()

    expect(html).toContain('Верфь:')
    expect(html).toContain('Год постройки:')
    expect(html).not.toContain('Shipyard:')
  })

  test('moves between the listings, and loops back round', async ({ page }) => {
    await page.goto(pathFor('/sales_yachts', 'en'))
    const section = page.locator(SECTION)
    const cards = section.locator('.min-w-80')
    await section.scrollIntoViewIfNeeded()
    const first = await cards.first().boundingBox()

    await section.getByRole('button', { name: 'Next yacht' }).click()
    await expect.poll(async () => (await cards.first().boundingBox())?.x).not.toBe(first?.x)

    // The legacy carousel looped, so the arrow is never dead.
    await expect(section.getByRole('button', { name: 'Previous yacht' })).toBeEnabled()
  })

  test('draws a listing an editor has only started without inventing the rest', async ({
    page,
  }) => {
    await page.goto(pathFor('/sales_yachts', 'en'))
    const section = page.locator(SECTION)

    // The second fixture listing carries a shipyard, a location and nothing else.
    await expect(section).toContainText('Sunseeker')
    await expect(section.locator('.min-w-80 > div')).toHaveCount(16)
  })
})
