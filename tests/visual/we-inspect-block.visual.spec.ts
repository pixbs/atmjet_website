import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'
import { hideDevOverlay, hideFloatingHeader, waitForPhotos } from './chrome'

/**
 * The inspection section (issue #126, `docs/legacy-inventory.md` section 5): the heading and
 * the row of cards as it rests on the first of them, running into the gutter as the legacy row
 * did. The gold line under them has no width until they move, so it is the e2e that pins it.
 *
 * The section itself is captured rather than a clip of the screen, as the other sections are:
 * this one sits at the foot of its page under a hero a whole screen tall (issue #114), so there
 * is not enough page under it to scroll it to the top of a screen clip.
 */
const SECTION = '[data-section="we-inspect"]'

test('the we inspect section matches its baseline', async ({ page }) => {
  await page.goto(pathFor('/sales_yachts', 'en'))
  const section = page.locator(SECTION)
  await expect(section).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await hideFloatingHeader(page)
  await hideDevOverlay(page)

  // The scroll comes first: a picture that has not been near the screen has not been fetched.
  await section.scrollIntoViewIfNeeded()
  await waitForPhotos(section)

  await expect(section).toHaveScreenshot('we-inspect.png')
})
