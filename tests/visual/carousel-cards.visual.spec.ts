import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'
import { hideFloatingHeader, waitForPhotos } from './chrome'

/**
 * The two cards drawn to sit in the carousel, as the legacy site drew them (issues #105 and #99,
 * `docs/legacy-inventory.md` section 6): the tall key feature with its words over the darkened
 * foot of the photograph, and the aircraft with its specifications on ruled rows.
 *
 * One clip per card, each taken where the carousel first shows it.
 */
const CARDS = [
  { name: 'key-feature', file: 'key-feature-cards.png' },
  { name: 'vehicle', file: 'vehicle-cards.png' },
]

for (const { name, file } of CARDS) {
  test(`the ${name} cards match their baseline`, async ({ page }) => {
    await page.goto(pathFor('/styleguide', 'en'))
    const cards = page.locator(`[data-cards="${name}"]`)
    await expect(cards).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    await hideFloatingHeader(page)

    await cards.scrollIntoViewIfNeeded()
    await waitForPhotos(cards)

    await expect(cards).toHaveScreenshot(file)
  })
}
