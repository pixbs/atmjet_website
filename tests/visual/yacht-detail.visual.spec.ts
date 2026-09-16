import { expect, test } from '@playwright/test'

import { ENABLED_LOCALES, pathFor } from '../e2e/routes'
import { hideDevOverlay, hideFloatingHeader, settlePage } from './chrome'

/**
 * One charter yacht, whole (issue #140, `docs/legacy-inventory.md` section 4): the band the page
 * opens on, the gallery beside the card that asks for her, and the room the card takes when it
 * is pulled up over the band's foot.
 */
const YACHT = '/yachts/azimut-serenity'

const VIEWPORTS = {
  mobile: { width: 390, height: 844 },
  desktop: { width: 1280, height: 900 },
} as const

for (const locale of ENABLED_LOCALES) {
  for (const [name, size] of Object.entries(VIEWPORTS)) {
    test(`the yacht page matches its baseline in ${locale} at ${name} width`, async ({ page }) => {
      await page.setViewportSize(size)
      await page.goto(pathFor(YACHT, locale))
      await page.locator('[data-section="yacht-detail"]').waitFor()
      await page.evaluate(() => document.fonts.ready)
      await hideFloatingHeader(page)
      await hideDevOverlay(page)

      await settlePage(page)

      await expect(page).toHaveScreenshot(`yacht-detail-${locale}-${name}.png`, { fullPage: true })
    })
  }
}

test('a yacht with one photograph draws the gallery the legacy could not', async ({ page }) => {
  // `Gallery selected={1}` rendered `<Image src={undefined}>` and took the page down (section 13,
  // entry 45); the strip here holds the one thumbnail there is.
  await page.setViewportSize(VIEWPORTS.desktop)
  await page.goto(pathFor('/yachts/sunseeker-bluewater', 'en'))
  await page.locator('[data-section="yacht-detail"]').waitFor()
  await page.evaluate(() => document.fonts.ready)
  await hideFloatingHeader(page)
  await hideDevOverlay(page)

  await settlePage(page)

  await expect(page).toHaveScreenshot('yacht-detail-one-photo.png', { fullPage: true })
})
