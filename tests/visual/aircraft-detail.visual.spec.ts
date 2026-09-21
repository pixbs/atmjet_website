import { expect, test } from '@playwright/test'

import { ENABLED_LOCALES, pathFor } from '../e2e/routes'
import { hideDevOverlay, hideFloatingHeader, settlePage } from './chrome'

/**
 * One aircraft, whole (issues #138 and #136, `docs/legacy-inventory.md` section 4): the band the
 * page opens on, the gallery beside the card that asks for the aircraft, the room the card takes
 * when it is pulled up over the band's foot, and below the rule the description card and the
 * figures beside the stack of photographs.
 *
 * And the layout the legacy fell back to for an aircraft its catalogue held no photograph of
 * (issue #137, `aircraft/[id]/old.tsx`): the band with nothing behind it, the model with the
 * sentences under it, the invitation to book and the card of ten rows.
 *
 * Seeded aircraft, reached by their registrations, because the catalogue's own slugs arrive
 * with the import of E5.7. The basic layout is captured in one language: what it is here to
 * prove is the shape of a page the rich baselines never reach, and its rows and sentences are
 * the same catalogue the rich ones already read in both.
 */
const AIRCRAFT = '/aircraft/MOUSE'
const UNPHOTOGRAPHED = '/aircraft/GATMB'

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

for (const [name, size] of Object.entries(VIEWPORTS)) {
  test(`an aircraft with no photographs matches its baseline at ${name} width`, async ({
    page,
  }) => {
    await page.setViewportSize(size)
    await page.goto(pathFor(UNPHOTOGRAPHED, 'en'))
    await page.locator('[data-section="aircraft-basic"]').waitFor()
    await page.evaluate(() => document.fonts.ready)
    await hideFloatingHeader(page)
    await hideDevOverlay(page)

    await settlePage(page)

    await expect(page).toHaveScreenshot(`aircraft-basic-en-${name}.png`, { fullPage: true })
  })
}
