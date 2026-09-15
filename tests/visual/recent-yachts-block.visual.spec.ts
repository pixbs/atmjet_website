import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'
import { hideDevOverlay, hideFloatingHeader } from './chrome'

/**
 * The recent yachts (issue #133, `docs/legacy-inventory.md` section 4): the heading, the card
 * round it, and the first listing of the carousel with its photographs and rows.
 */
const SECTION = '[data-section="recent-yachts"]'

test('the recent yachts match their baseline', async ({ page }) => {
  await page.goto(pathFor('/sales_yachts', 'en'))
  const section = page.locator(SECTION)
  await expect(section).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await hideFloatingHeader(page)
  await hideDevOverlay(page)

  await section.scrollIntoViewIfNeeded()
  // Only the photograph on show: the slides behind it are lazy, as the legacy slides were.
  await expect(section.locator('img').first()).toHaveJSProperty('complete', true)

  await expect(section).toHaveScreenshot('recent-yachts.png')
})
