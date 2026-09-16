import { expect, test } from '@playwright/test'

import { ENABLED_LOCALES, pathFor } from '../e2e/routes'
import { hideDevOverlay, hideFloatingHeader, settlePage } from './chrome'

/**
 * One aircraft, whole (issues #138 and #136, `docs/legacy-inventory.md` section 4): the band the
 * page opens on, the gallery beside the card that asks for the aircraft, and the room the card
 * takes when it is pulled up over the band's foot.
 *
 * A seeded aircraft, reached by its registration, because the catalogue's own slugs arrive with
 * the import of E5.7.
 */
const AIRCRAFT = '/aircraft/MOUSE'

const VIEWPORTS = {
  mobile: { width: 390, height: 844 },
  desktop: { width: 1280, height: 900 },
} as const

for (const locale of ENABLED_LOCALES) {
  for (const [name, size] of Object.entries(VIEWPORTS)) {
    test(`the aircraft page matches its baseline in ${locale} at ${name} width`, async ({
      page,
    }) => {
      await page.setViewportSize(size)
      await page.goto(pathFor(AIRCRAFT, locale))
      await page.locator('[data-section="aircraft-detail"]').waitFor()
      await page.evaluate(() => document.fonts.ready)
      await hideFloatingHeader(page)
      await hideDevOverlay(page)

      await settlePage(page)

      await expect(page).toHaveScreenshot(`aircraft-detail-${locale}-${name}.png`, {
        fullPage: true,
      })
    })
  }
}
