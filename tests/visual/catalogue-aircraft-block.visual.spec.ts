import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'
import { hideDevOverlay, hideFloatingHeader, waitForPhotos } from './chrome'

/**
 * The aircraft carousel (issue #142, `docs/legacy-inventory.md` section 4): the heading, the
 * cards, and the arrow against each edge of the frame.
 *
 * Both widths, because the cards are one to a screen on a phone and three across on a desktop,
 * and the arrows move outside the frame from `lg` up.
 */
const SECTION = '[data-section="catalogue-aircraft"]'

for (const width of [390, 1280]) {
  test(`the aircraft carousel matches its baseline at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(pathFor('/sales_dept', 'en'))
    const section = page.locator(SECTION)
    await expect(section).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    await hideFloatingHeader(page)
    await hideDevOverlay(page)

    // The scroll comes first: a picture that has not been near the screen has not been fetched.
    await section.scrollIntoViewIfNeeded()
    await waitForPhotos(section)

    await expect(section).toHaveScreenshot(`catalogue-aircraft-${width}.png`)
  })
}
