import { expect, test } from '@playwright/test'

import { ENABLED_LOCALES, pathFor } from '../e2e/routes'
import { hideDevOverlay, hideFloatingHeader, hideHeroVideo, settlePage } from './chrome'

/**
 * The home page, whole (issue #134, `docs/legacy-inventory.md` section 4): the eleven sections
 * in the legacy order, the spacing between them and the gutter, in both languages and at both
 * widths, because the words are what decides how tall each section grows.
 *
 * Each section has a baseline of its own; this is the page around them. The curtain over it is
 * gone by the time the shutter opens, which is the state a visitor reads the page in.
 */
const VIEWPORTS = {
  mobile: { width: 390, height: 844 },
  desktop: { width: 1280, height: 900 },
} as const

for (const locale of ENABLED_LOCALES) {
  for (const [name, size] of Object.entries(VIEWPORTS)) {
    test(`home page matches its baseline in ${locale} at ${name} width`, async ({ page }) => {
      await page.setViewportSize(size)
      await page.goto(pathFor('/', locale))
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      await page.evaluate(() => document.fonts.ready)
      await hideHeroVideo(page)
      await hideFloatingHeader(page)
      await hideDevOverlay(page)

      await settlePage(page)

      await expect(page).toHaveScreenshot(`home-${locale}-${name}.png`, { fullPage: true })
    })
  }
}
