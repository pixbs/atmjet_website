import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'
import { hideDevOverlay, hideFloatingHeader } from './chrome'

/**
 * The booking form (issue #152, `docs/legacy-inventory.md` section 7.2): three ruled fields, the
 * chips under them and the wide button at the foot.
 *
 * Both viewports, because the chips wrap on a narrow screen and the fields are the same width
 * as the panel they are drawn on.
 */
const SECTION = '[data-section="booking-form-example"]'

const VIEWPORTS = {
  mobile: { width: 390, height: 844 },
  desktop: { width: 1440, height: 900 },
} as const

for (const [name, size] of Object.entries(VIEWPORTS)) {
  test(`the booking form matches its baseline at ${name} width`, async ({ page }) => {
    await page.setViewportSize(size)
    await page.goto(pathFor('/styleguide', 'en'))
    const section = page.locator(SECTION)
    await section.scrollIntoViewIfNeeded()
    await expect(section).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    await hideFloatingHeader(page)
    await hideDevOverlay(page)

    await expect(section).toHaveScreenshot(`booking-form-${name}.png`)
  })
}
