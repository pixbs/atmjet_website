import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'
import { hideDevOverlay, hideFloatingHeader } from './chrome'

/**
 * The wordmark note (issue #149, `docs/legacy-inventory.md` section 4): the mark, the rule and
 * the sentence. Both widths, because the rule lies across the card on a narrow screen and
 * stands between the mark and the words on a wide one.
 *
 * On the citizens page, which answers in Russian alone, and where the legacy lost the mark's
 * height to a misspelt prop (section 13, entry 75) — the capture is of the height it meant.
 */
const SECTION = '[data-section="wordmark-note"]'

for (const width of [390, 1280]) {
  test(`the wordmark note matches its baseline at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(pathFor('/citizens', 'ru'))
    const section = page.locator(SECTION)
    await expect(section).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    await hideFloatingHeader(page)
    await hideDevOverlay(page)

    await section.scrollIntoViewIfNeeded()

    await expect(section).toHaveScreenshot(`wordmark-note-${width}.png`)
  })
}
