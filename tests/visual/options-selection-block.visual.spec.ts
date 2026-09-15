import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'
import { hideDevOverlay, hideFloatingHeader, waitForPhotos } from './chrome'

/**
 * The services either department provides (issue #127, `docs/legacy-inventory.md` section 5):
 * the heading, the two cards beside each other, and the boxes under each paragraph.
 */
const SECTION = '[data-section="options-selection"]'

for (const width of [390, 1280]) {
  test(`the options selection matches its baseline at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(pathFor('/sales_dept', 'en'))
    const section = page.locator(SECTION)
    await expect(section).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    await hideFloatingHeader(page)
    await hideDevOverlay(page)

    await section.scrollIntoViewIfNeeded()
    await waitForPhotos(section)

    await expect(section).toHaveScreenshot(`options-selection-${width}.png`)
  })
}
