import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'
import { hideDevOverlay, hideFloatingHeader } from './chrome'

/**
 * The yachts for sale (issue #100, `docs/legacy-inventory.md` section 6): the photographs on the
 * left, the three counts with their gradient icons, and the eight ruled rows — the second card
 * with only one of them filled in.
 */
const SECTION = '[data-section="yacht-cards"]'

test('the sale yacht cards match their baseline', async ({ page }) => {
  await page.goto(pathFor('/styleguide', 'en'))
  const section = page.locator(SECTION)
  await expect(section).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await hideFloatingHeader(page)
  await hideDevOverlay(page)

  await section.scrollIntoViewIfNeeded()
  // Only the photograph on screen: the slides behind it are lazy, as the legacy slides were,
  // and a browser leaves one it has not had to draw yet unfetched.
  await expect(section.locator('img').first()).toHaveJSProperty('complete', true)

  await expect(section).toHaveScreenshot('yacht-cards.png')
})
