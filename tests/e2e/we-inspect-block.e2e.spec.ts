import { expect, test } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The inspection section as a block (issue #126, `docs/legacy-inventory.md` section 5): the
 * cards come from the document and the carousel around them is the only part that needs a
 * script, so the words are on the page before it runs.
 */
const SECTION = '[data-section="we-inspect"]'

test.describe('the we inspect section', () => {
  test('is in the HTML the server sends, every card of it', async ({ request }) => {
    const html = await (await request.get(pathFor('/sales_yachts', 'en'))).text()

    expect(html).toContain('data-section="we-inspect"')
    expect(html).toContain('What we inspect')
    expect(html).toContain('The hull')
    expect(html).toContain('A day at sea with the systems under load, not at the dock.')
  })

  test('draws one card per slide the block carries', async ({ page }) => {
    await page.goto(pathFor('/sales_yachts', 'en'))

    await expect(page.locator(`${SECTION} [data-card="inspect"]`)).toHaveCount(5)
  })

  test('moves the cards along on a drag, and fills the line under them', async ({ page }) => {
    await page.goto(pathFor('/sales_yachts', 'en'))
    const section = page.locator(SECTION)
    const first = section.locator('[data-card="inspect"]').first()
    await expect(first).toBeVisible()
    const box = await first.boundingBox()
    expect(box).not.toBeNull()

    const bar = section.locator('[aria-hidden="true"]').last()
    const filled = async () => Number((await bar.getAttribute('style'))?.match(/[\d.]+/)?.[0] ?? -1)
    expect(await filled()).toBe(0)

    // The legacy carousel had no arrows and no dots: dragging is the only way through it.
    const middle = box!.y + box!.height / 2
    await page.mouse.move(box!.x + box!.width / 2, middle)
    await page.mouse.down()
    await page.mouse.move(box!.x, middle, { steps: 12 })
    await page.mouse.up()

    await expect.poll(async () => (await first.boundingBox())?.x ?? box!.x).toBeLessThan(box!.x)
    expect(await filled()).toBeGreaterThan(0)
  })

  test('speaks the language of the page it is on', async ({ request }) => {
    const html = await (await request.get(pathFor('/sales_yachts', 'ru'))).text()

    expect(html).toContain('Ходовые испытания')
    expect(html).not.toContain('The sea trial')
  })
})
