import { expect, test, type Locator } from '@playwright/test'

import { pathFor } from '../e2e/routes'
import { hideFloatingHeader, waitForPhotos } from './chrome'

/**
 * The reasons-to-fly cards as the legacy site drew them (issue #102,
 * `docs/legacy-inventory.md` section 6): a figure in gold, the reason beside a photograph, and
 * the card with neither that the group charters page uses.
 *
 * Twice, because the card is drawn for the stack: once as the section first shows it and once
 * with the stack scrolled through, where the cards have come to rest on top of each other.
 * Both are captures of the screen rather than of the stack, because the stack is taller than
 * the screen and what it looks like depends on where the screen is.
 *
 * Both scrolls are counted from the stack rather than from the end of the page, so whatever is
 * added to the styleguide after it cannot move these captures, and both are `instant` because
 * the stylesheet scrolls smoothly (the legacy `scroll-smooth`) and a capture would otherwise
 * catch the page still moving.
 */
const CARDS = '[data-cards="why-us"]'

/** The top of the stack, 100px down the screen: the section as it is first met. */
const toTheTop = (cards: Locator) =>
  cards.evaluate((stack) =>
    window.scrollTo({
      top: stack.getBoundingClientRect().top + window.scrollY - 100,
      behavior: 'instant',
    }),
  )

/** The bottom of the stack at the bottom of the screen: every card that can rest has rested. */
const pastTheStack = (cards: Locator) =>
  cards.evaluate((stack) =>
    window.scrollTo({
      top: stack.getBoundingClientRect().bottom + window.scrollY - window.innerHeight,
      behavior: 'instant',
    }),
  )

test('the why us cards match their baseline', async ({ page }) => {
  await page.goto(pathFor('/styleguide', 'en'))
  const cards = page.locator(CARDS)
  await expect(cards).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await hideFloatingHeader(page)

  // The scroll comes first: a picture that has not been near the screen has not been fetched.
  await toTheTop(cards)
  await waitForPhotos(cards)
  await toTheTop(cards)
  await expect.poll(async () => Math.round((await cards.boundingBox())?.y ?? -1)).toBe(100)

  await expect(page).toHaveScreenshot('why-us-cards.png')
})

test('the why us cards match their baseline once they have stacked', async ({ page }) => {
  await page.goto(pathFor('/styleguide', 'en'))
  const cards = page.locator(CARDS)
  await expect(cards).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await hideFloatingHeader(page)

  await pastTheStack(cards)
  await waitForPhotos(cards)
  await pastTheStack(cards)
  await expect.poll(async () => Math.round((await cards.boundingBox())?.y ?? -1)).toBeLessThan(32)

  await expect(page).toHaveScreenshot('why-us-stacked.png')
})
