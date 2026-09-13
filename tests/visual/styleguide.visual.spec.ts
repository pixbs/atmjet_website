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

  // The motion primitives reveal on scroll and hold their end state, so the page is scrolled
  // once and the reveal awaited: the screenshot then always shows the same frame.
  const revealed = page.getByRole('heading', { level: 4, name: 'Revealed on scroll' }).locator('..')
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await expect(revealed).toHaveCSS('opacity', '1')
  await page.evaluate(() => window.scrollTo(0, 0))

  await expect(page).toHaveScreenshot('styleguide.png', { fullPage: true })
})
