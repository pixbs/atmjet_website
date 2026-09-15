import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'
import { hideDevOverlay, hideFloatingHeader } from './chrome'

/**
 * The empty legs section (issue #117, `docs/legacy-inventory.md` section 5): the heading beside
 * the flights, the three cards the fixture seeds, and the gradient card under them.
 */
const SECTION = '[data-section="empty-legs"]'

test('the empty legs section matches its baseline', async ({ page }) => {
  await page.goto(pathFor('/empty_legs', 'en'))
  const section = page.locator(SECTION)
  await expect(section).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await hideFloatingHeader(page)
  await hideDevOverlay(page)

  // The cards reveal on scroll and the prices count up; under the reduced motion this tier runs
  // with, the counter shows its final text, which is what waiting for it proves.
  await section.scrollIntoViewIfNeeded()
  await expect(section.getByText('$12,000')).toBeVisible()

  await expect(section).toHaveScreenshot('empty-legs.png')
})
