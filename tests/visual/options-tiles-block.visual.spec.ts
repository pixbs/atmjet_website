import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'
import { hideFloatingHeader, waitForPhotos } from './chrome'

/**
 * The options tiles (issue #119, `docs/legacy-inventory.md` section 5): two photographs under
 * the darkening overlay, side by side on a wide screen and stacked on a narrow one, which is
 * why both viewports are captured.
 */
const SECTION = '[data-section="options-tiles"]'

const VIEWPORTS = {
  mobile: { width: 390, height: 844 },
  desktop: { width: 1440, height: 900 },
} as const

for (const [name, size] of Object.entries(VIEWPORTS)) {
  test(`the options tiles match their baseline at ${name} width`, async ({ page }) => {
    await page.setViewportSize(size)
    await page.goto(pathFor('/partners', 'en'))
    const section = page.locator(SECTION)
    await expect(section).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    await hideFloatingHeader(page)

    // The section fits on the screen at both widths, so the clip is the element itself; the
    // pictures are awaited because an upload that has not been near the screen is not fetched.
    await section.scrollIntoViewIfNeeded()
    await waitForPhotos(section)

    await expect(section).toHaveScreenshot(`options-tiles-${name}.png`)
  })
}
