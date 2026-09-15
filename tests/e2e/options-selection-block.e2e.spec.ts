import { expect, test } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The services either department provides (issue #127, `docs/legacy-inventory.md` section 5):
 * one heading over two cards, each with its photograph, its paragraph and its boxed promises.
 */
const SECTION = '[data-section="options-selection"]'

test.describe('the options selection', () => {
  test('is in the HTML the server sends, with both cards in it', async ({ request }) => {
    const html = await (await request.get(pathFor('/sales_dept', 'en'))).text()

    expect(html).toContain('data-section="options-selection"')
    expect(html).toContain('Buying an aircraft, start to finish')
    expect(html).toContain('Legal department')
    expect(html).toContain('Finance department')
  })

  test('draws each promise as a box of its own', async ({ page }) => {
    await page.goto(pathFor('/sales_dept', 'en'))
    const cards = page.locator(SECTION).locator('[class*="bg-graphite-950"]')
    await expect(cards).toHaveCount(2)

    // The legacy card split one string into these; they are rows now (issue #72).
    await expect(cards.first().getByText('A lien check on the airframe')).toBeVisible()
    await expect(cards.first().locator('[class*="bg-graphite-900"]')).toHaveCount(5)
    await expect(cards.last().locator('[class*="bg-graphite-900"]')).toHaveCount(4)
  })

  test('says it in the language of the page, on both pages that carry it', async ({ request }) => {
    const aircraft = await (await request.get(pathFor('/sales_dept', 'ru'))).text()
    const yachts = await (await request.get(pathFor('/sales_yachts', 'ru'))).text()

    expect(aircraft).toContain('Юридический отдел')
    expect(aircraft).toContain('Проверка залога по борту')
    expect(aircraft).not.toContain('A lien check on the airframe')
    // The same two departments, saying what a hull needs rather than an airframe.
    expect(yachts).toContain('Проверка залога по корпусу')
  })
})
