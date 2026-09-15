import { expect, test } from '@playwright/test'

import { ENABLED_LOCALES, pathFor } from '../e2e/routes'
import { hideDevOverlay, hideFloatingHeader, hideHeroVideo } from './chrome'

/**
 * The home page hero (issue #111, `docs/legacy-inventory.md` section 5): the wordmark and the
 * promise over the darkening, on both viewports and in both languages. What the baseline holds
 * is everything drawn over the video, which `hideHeroVideo` takes out of the frame.
 */
const SECTION = '[data-section="hero-video"]'

const VIEWPORTS = {
  mobile: { width: 390, height: 844 },
  desktop: { width: 1280, height: 720 },
} as const

for (const [name, size] of Object.entries(VIEWPORTS)) {
  for (const locale of ENABLED_LOCALES) {
    test(`the hero video matches its baseline at ${name} width in ${locale}`, async ({ page }) => {
      await page.setViewportSize(size)
      await page.goto(pathFor('/', locale))
      const section = page.locator(SECTION)
      await expect(section).toBeVisible()
      await page.evaluate(() => document.fonts.ready)
      await hideFloatingHeader(page)
      await hideDevOverlay(page)
      await hideHeroVideo(page)

      await expect(section).toHaveScreenshot(`hero-video-${name}-${locale}.png`)
    })
  }
}
