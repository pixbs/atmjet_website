import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'

/**
 * The 404 page has no legacy counterpart to compare against (`docs/legacy-inventory.md`
 * section 2.5): the legacy site served Next's unstyled default. This pins what the rewrite
 * serves instead, so a change to the parity base layer or to the copy shows up here.
 */
test('not found page matches its baseline', async ({ page }) => {
  await page.goto(pathFor('/no-such-page', 'en'))
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.evaluate(() => document.fonts.ready)

  await expect(page).toHaveScreenshot('not-found.png', { fullPage: true })
})
