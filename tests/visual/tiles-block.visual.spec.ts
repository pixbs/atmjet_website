import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'
import { hideFloatingHeader, waitForPhotos } from './chrome'

/**
 * The tiles grid (issue #122, `docs/legacy-inventory.md` section 5): two to a row on a narrow
 * screen and three from the medium width up, which is why both viewports are captured.
 *
 * The tiles scale in when the grid is reached; this tier runs with reduced motion, so what is
 * captured is where they come to rest.
 */
const SECTION = '[data-section="tiles"]'

const VIEWPORTS = {
  mobile: { width: 390, height: 844 },
  desktop: { width: 1440, height: 900 },
} as const

for (const [name, size] of Object.entries(VIEWPORTS)) {
  test(`the tiles grid matches its baseline at ${name} width`, async ({ page }) => {
    await page.setViewportSize(size)
    await page.goto(pathFor('/', 'en'))
    const section = page.locator(SECTION)
    await expect(section).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    await hideFloatingHeader(page)

    await section.scrollIntoViewIfNeeded()
    await waitForPhotos(section)

    await expect(section).toHaveScreenshot(`tiles-${name}.png`)
  })
}
