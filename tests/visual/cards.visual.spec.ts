import { expect, test, type Locator, type Page } from '@playwright/test'

import { pathFor } from '../e2e/routes'

/**
 * The four cards as the legacy site drew them (issue #103, `docs/legacy-inventory.md` sections 6
 * and 5): the group cards stacked in one rounded box with the photograph fading out under the
 * copy, the file cards side by side, the privileges stacked so each sticks below the one above
 * it, and the yachts promotion with its three columns and the invitation inside it.
 *
 * One clip per card rather than one over the section, which is what the issue asks to see and
 * what keeps a failure pointing at the card that changed.
 */
const CARDS = [
  { name: 'group', file: 'group-cards.png' },
  { name: 'file', file: 'file-cards.png' },
  { name: 'privilege', file: 'privilege-cards.png' },
  { name: 'yachts', file: 'yachts-card.png' },
]

/** The pictures are uploads and load lazily, so a capture can otherwise be of empty boxes. */
async function waitForPhotos(cards: Locator) {
  const photos = cards.locator('img')
  // The privileges carry inline icons rather than photographs, so there is nothing to wait for.
  if ((await photos.count()) === 0) return

  await expect(photos.first()).toBeVisible()
  for (const photo of await photos.all()) {
    await expect(photo).toHaveJSProperty('complete', true)
  }
}

/**
 * The header floats over the page, and a card taller than the viewport is captured from its top
 * down, so the bar would otherwise be painted across it. It is `fixed`, so nothing moves.
 */
async function hideFloatingHeader(page: Page) {
  await page.addStyleTag({ content: '[data-section="header"] { display: none }' })
}

for (const { name, file } of CARDS) {
  test(`the ${name} card matches its baseline`, async ({ page }) => {
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
