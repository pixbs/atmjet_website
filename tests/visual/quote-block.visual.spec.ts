import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'
import { hideDevOverlay, hideFloatingHeader } from './chrome'

/**
 * The two quote cards (issue #132, `docs/legacy-inventory.md` section 4): the wordmark over the
 * words, the words against the lighter panel with the rule down their left, and the line saying
 * whose they are under that, in the gold gradient.
 *
 * The capture is of the card itself, which is as tall as the words in it, on the page that
 * carries them — the citizens page, which answers in Russian alone (issue #149).
 */
for (const variant of ['press', 'founder'] as const) {
  test(`the ${variant} quote card matches its baseline`, async ({ page }) => {
    await page.goto(pathFor('/citizens', 'ru'))
    const card = page.locator(`[data-quote="${variant}"]`)
    await expect(card).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    await hideFloatingHeader(page)
    await hideDevOverlay(page)

    await expect(card).toHaveScreenshot(`quote-${variant}.png`)
  })
}
