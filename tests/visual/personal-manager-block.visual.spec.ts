import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'
import { hideDevOverlay, hideFloatingHeader, waitForPhotos } from './chrome'

/**
 * The personal manager (issue #124, `docs/legacy-inventory.md` section 5): the photograph on the
 * right, the gold heading and the chips, without the stray word and the debug background the
 * legacy drew behind the picture.
 */
const SECTION = '[data-section="personal-manager"]'

test('the personal manager matches its baseline', async ({ page }) => {
  await page.goto(pathFor('/partners', 'en'))
  const section = page.locator(SECTION)
  await expect(section).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await hideFloatingHeader(page)
  await hideDevOverlay(page)

  await section.scrollIntoViewIfNeeded()
  await waitForPhotos(section)

  await expect(section).toHaveScreenshot('personal-manager.png')
})
