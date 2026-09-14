import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'

/**
 * The empty leg card as the legacy site drew it (issue #104, `docs/legacy-inventory.md` section
 * 6): the date and the booking button on one line, the price beside what a charter would cost
 * struck through and the red discount badge, and the route underneath.
 *
 * Three cards, because the third is the one with no price and it has to hold its shape without
 * the struck-through figure or the badge.
 */
test('the empty leg cards match their baseline', async ({ page }) => {
  await page.goto(pathFor('/styleguide', 'en'))
  const section = page.locator('[data-section="empty-legs"]')
  await expect(section).toBeVisible()
  await page.evaluate(() => document.fonts.ready)

  // The cards reveal on scroll and the price counts up, so both are given their end state before
  // the capture; under the reduced motion this tier runs with, the counter shows the final text.
  await section.scrollIntoViewIfNeeded()
  await expect(section.getByText('$12,000')).toBeVisible()

  await expect(section).toHaveScreenshot('empty-leg-cards.png')
})
