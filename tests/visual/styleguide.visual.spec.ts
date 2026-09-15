import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'

/**
 * The parity base layer (issue #48) has no single legacy page to compare against: the ported
 * sections do that in E6-E8. This spec pins the fixture page that renders every global rule,
 * so a change to the base layer or to a token shows up as a diff here first.
 */
test('styleguide matches its baseline', async ({ page }) => {
  await page.goto(pathFor('/styleguide', 'en'))
  await expect(page.getByRole('heading', { level: 1, name: 'Heading one' })).toBeVisible()
  await page.evaluate(() => document.fonts.ready)

  // The viewport is grown to the whole page rather than scrolled through it. A reveal runs
  // again every time its card comes back into view and a full-page capture brings the page into
  // view all at once, so a capture taken from the top catches the cards at the bottom mid-fade;
  // with everything in view they are all in their end state, and the lazy pictures are all
  // fetched. The height is read twice because the first resize reflows the page.
  const { width } = page.viewportSize() ?? { width: 1280 }
  for (let pass = 0; pass < 2; pass++) {
    const height = await page.evaluate(() => document.documentElement.scrollHeight)
    await page.setViewportSize({ width, height })
  }

  const revealed = page.getByRole('heading', { level: 4, name: 'Revealed on scroll' }).locator('..')
  await expect(revealed).toHaveCSS('opacity', '1')
  await expect(page.locator('[data-cards="yachts"] > div')).toHaveCSS('opacity', '1')
  // A slide waiting its turn inside a carousel is lazy, as the legacy slides were (issue #100),
  // and a browser never fetches one it has not had to draw; every photograph the capture
  // contains is eager, so those are the ones waited for.
  for (const photo of await page.locator('img:not([loading="lazy"])').all()) {
    await expect(photo).toHaveJSProperty('complete', true)
  }

  await expect(page).toHaveScreenshot('styleguide.png', { fullPage: true })
})
