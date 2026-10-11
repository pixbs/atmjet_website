import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'
import { hideDevOverlay } from './chrome'

/**
 * The privacy policy has no legacy counterpart to compare against: the legacy cookie banner
 * linked to a page that answered 404 (`docs/legacy-inventory.md` section 13, entry 71, issue
 * #57). This pins the first screen of the rewrite's, so a change to the parity base layer or to
 * how the block draws headings, lists and links shows up here.
 */
for (const locale of ['en', 'ru'] as const) {
  test(`the privacy policy matches its baseline in ${locale}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(pathFor('/privacy', locale))
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    await hideDevOverlay(page)

    await expect(page).toHaveScreenshot(`privacy-${locale}.png`)
  })
}
