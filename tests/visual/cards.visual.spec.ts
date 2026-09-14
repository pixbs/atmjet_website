import { expect, test, type Locator } from '@playwright/test'

import { pathFor } from '../e2e/routes'

/**
 * The group and file cards as the legacy site drew them (issue #103,
 * `docs/legacy-inventory.md` section 6): two group cards stacked in one rounded box with the
 * photograph fading out under the copy, and two file cards side by side.
 *
 * One clip per card rather than one over the section: each fits in the viewport, so the capture
 * is taken in one pass with the floating header out of the way instead of stitched over it.
 */
const CARDS = [
  { name: 'group', file: 'group-cards.png' },
  { name: 'file', file: 'file-cards.png' },
]

/** The pictures are uploads and load lazily, so a capture can otherwise be of empty boxes. */
async function waitForPhotos(cards: Locator) {
  const photos = cards.locator('img')
  await expect(photos.first()).toBeVisible()
  for (const photo of await photos.all()) {
    await expect(photo).toHaveJSProperty('complete', true)
  }
}

for (const { name, file } of CARDS) {
  test(`the ${name} cards match their baseline`, async ({ page }) => {
    await page.goto(pathFor('/styleguide', 'en'))
    const cards = page.locator(`[data-cards="${name}"]`)
    await expect(cards).toBeVisible()
    await page.evaluate(() => document.fonts.ready)

    await cards.scrollIntoViewIfNeeded()
    await waitForPhotos(cards)

    await expect(cards).toHaveScreenshot(file)
  })
}
