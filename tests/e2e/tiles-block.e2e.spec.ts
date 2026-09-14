import { expect, test } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The tiles grid as a block (issue #122, `docs/legacy-inventory.md` section 5): the tiles scale
 * in one after another when the grid is scrolled to, and stay in once they have.
 *
 * The legacy watched the grid with one observer and animated every tile from that reading;
 * each tile watches itself here, so what is worth asserting is that they are still hidden
 * before the grid is reached and shown after it.
 */
const TILES = '[data-tiles] > div'

test.describe('the tiles grid', () => {
  test('is in the HTML the server sends, before any script runs', async ({ request }) => {
    const html = await (await request.get(pathFor('/cargo_charter', 'en'))).text()

    expect(html).toContain('data-section="tiles"')
  })

  test('draws one tile per row the block carries', async ({ page }) => {
    await page.goto(pathFor('/cargo_charter', 'en'))

    // Eight, as the legacy grid sliced one picture into eight.
    await expect(page.locator(TILES)).toHaveCount(8)
  })

  test('holds the tiles back until the grid is scrolled to', async ({ page }) => {
    await page.goto(pathFor('/cargo_charter', 'en'))
    const first = page.locator(TILES).first()

    await expect(first).toHaveCount(1)
    await expect(first).toHaveCSS('opacity', '0')

    await first.scrollIntoViewIfNeeded()

    await expect(first).toHaveCSS('opacity', '1')
  })

  test('leaves them in once they have arrived', async ({ page }) => {
    await page.goto(pathFor('/cargo_charter', 'en'))
    const first = page.locator(TILES).first()

    await first.scrollIntoViewIfNeeded()
    await expect(first).toHaveCSS('opacity', '1')

    // `triggerOnce` on the legacy grid: scrolling away does not wind them back.
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))

    await expect(first).toHaveCSS('opacity', '1')
  })
})
