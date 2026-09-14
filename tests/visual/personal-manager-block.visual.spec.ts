import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'
import { hideDevOverlay, hideFloatingHeader, waitForPhotos } from './chrome'

/**
 * The personal manager (issue #124, `docs/legacy-inventory.md` section 5): the photograph on the
 * right from the large breakpoint up, the gold heading, the paragraph and the chips on the left.
 * The stray text and the red placeholder the legacy drew are gone, which is the decision the
 * issue records, so this baseline is the clean render.
 */
const SECTION = '[data-section="personal-manager"]'

test('the personal manager section matches its baseline', async ({ page }) => {
  await page.goto(pathFor('/sales_dept', 'en'))
  const section = page.locator(SECTION)
  await expect(section).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await hideFloatingHeader(page)
  await hideDevOverlay(page)

  // The scroll comes first: a picture that has not been near the screen has not been fetched.
  await section.scrollIntoViewIfNeeded()
  await waitForPhotos(section)

  await expect(section).toHaveScreenshot('personal-manager.png')
})
