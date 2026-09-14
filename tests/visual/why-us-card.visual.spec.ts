import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'
import { hideFloatingHeader, waitForPhotos } from './chrome'

/**
 * The reasons-to-fly cards as the legacy site drew them (issue #102,
 * `docs/legacy-inventory.md` section 6): a figure in gold, the reason beside a photograph, and
 * the card with neither that the group charters page uses.
 *
 * Twice, because the card is drawn for the stack: once as the section first shows it and once
 * with the page scrolled to the end, where the cards have come to rest on top of each other.
 * Both are captures of the screen rather than of the stack, because the stack is taller than
 * the screen and what it looks like depends on where the screen is.
 */
const CARDS = '[data-cards="why-us"]'

/** Puts the top of the stack 100px down the screen, wherever the page it sits on has grown to. */
async function scrollToStack(page: import('@playwright/test').Page) {
  await page
    .locator(CARDS)
    .evaluate((stack) =>
      window.scrollTo(0, stack.getBoundingClientRect().top + window.scrollY - 100),
    )
}

test('the why us cards match their baseline', async ({ page }) => {
  await page.goto(pathFor('/styleguide', 'en'))
  const cards = page.locator(CARDS)
  await expect(cards).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await hideFloatingHeader(page)

  // The scroll comes first: a picture that has not been near the screen has not been fetched.
  await scrollToStack(page)
  await waitForPhotos(cards)
  await scrollToStack(page)
  await expect.poll(async () => Math.round((await cards.boundingBox())?.y ?? -1)).toBe(100)

  await expect(page).toHaveScreenshot('why-us-cards.png')
})

test('the why us cards match their baseline once they have stacked', async ({ page }) => {
  await page.goto(pathFor('/styleguide', 'en'))
  const cards = page.locator(CARDS)
  await expect(cards).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await hideFloatingHeader(page)

  // The end of the page, which is as far as the stack can be pushed: the screen then holds the
  // cards that have come to rest and the ones still arriving under them.
  const toTheEnd = () =>
    page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await toTheEnd()
  await waitForPhotos(cards)
  await toTheEnd()
  await expect.poll(async () => Math.round((await cards.boundingBox())?.y ?? -1)).toBeLessThan(32)

  await expect(page).toHaveScreenshot('why-us-stacked.png')
})
