import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'
import { hideDevOverlay, hideFloatingHeader } from './chrome'

/**
 * The two quote cards (issue #132, `docs/legacy-inventory.md` section 4): the wordmark over the
 * words, the words against the lighter panel with the rule down their left, and the line saying
 * whose they are under that, in the gold gradient.
 *
 * A clip of the screen taken from the card's own corner rather than from the screen's, so what
 * is captured cannot move when a section above it changes.
 */

/** Each card in full: they are as tall as the words in them, and his run to three lines. */
const HEIGHTS = { press: 356, founder: 392 }

for (const variant of ['press', 'founder'] as const) {
  test(`the ${variant} quote card matches its baseline`, async ({ page }) => {
    await page.goto(pathFor('/citizens', 'en'))
    const card = page.locator(`[data-quote="${variant}"]`)
    await expect(card).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    await hideFloatingHeader(page)
    await hideDevOverlay(page)

    await card.evaluate((element) =>
      window.scrollTo({
        top: element.getBoundingClientRect().top + window.scrollY,
        behavior: 'instant',
      }),
    )

    const box = await card.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.y + HEIGHTS[variant]).toBeLessThanOrEqual(page.viewportSize()!.height)

    await expect(page).toHaveScreenshot(`quote-${variant}.png`, {
      clip: { x: box!.x, y: box!.y, width: box!.width, height: HEIGHTS[variant] },
    })
  })
}
