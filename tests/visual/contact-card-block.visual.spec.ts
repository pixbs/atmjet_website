import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'
import { hideDevOverlay, hideFloatingHeader, waitForPhotos } from './chrome'

/**
 * The contact card (issue #133, `docs/legacy-inventory.md` section 4): the words on the left of
 * the picture, which three passes of the same gradient darken until they can be read.
 */
const SECTION = '[data-section="contact-card"]'

test('the contact card matches its baseline', async ({ page }) => {
  await page.goto(pathFor('/aircraft', 'en'))
  const section = page.locator(SECTION)
  await expect(section).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await hideFloatingHeader(page)
  await hideDevOverlay(page)

  // The scroll comes first: a picture that has not been near the screen has not been fetched.
  await section.scrollIntoViewIfNeeded()
  await waitForPhotos(section)

  await expect(section).toHaveScreenshot('contact-card.png')
})
