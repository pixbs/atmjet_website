import { expect, type Locator, type Page } from '@playwright/test'

/** What a clip of one component has to take care of before the shutter opens. */

/**
 * The header floats over the page, and a card taller than the viewport is captured from its top
 * down, so the bar would otherwise be painted across it. It is `fixed`, so nothing moves.
 */
export async function hideFloatingHeader(page: Page) {
  await page.addStyleTag({ content: '[data-section="header"] { display: none }' })
}

/** The pictures are uploads and load lazily, so a capture can otherwise be of empty boxes. */
export async function waitForPhotos(cards: Locator) {
  const photos = cards.locator('img')
  // A card may carry inline icons rather than photographs, and then there is nothing to wait for.
  if ((await photos.count()) === 0) return

  await expect(photos.first()).toBeVisible()
  for (const photo of await photos.all()) {
    await expect(photo).toHaveJSProperty('complete', true)
  }
}

/**
 * The dev server paints its own indicator over the bottom-left corner, and a section at the
 * foot of a page is captured with that corner in the clip. A preview deployment has no such
 * badge, so a baseline holding one could never match it.
 */
export async function hideDevOverlay(page: Page) {
  await page.addStyleTag({ content: 'nextjs-portal { display: none }' })
}
