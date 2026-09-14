import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'
import { hideDevOverlay, hideFloatingHeader, waitForPhotos } from './chrome'

/**
 * The three descriptors (issue #133, `docs/legacy-inventory.md` section 4). Each section is
 * captured on its own rather than as a clip of the screen: they sit low on pages that open with
 * a hero a whole screen tall, so there is not enough page under them to scroll them to the top.
 */
const SECTIONS = [
  { name: 'descriptor', path: '/empty_legs' },
  { name: 'framed-descriptor', path: '/sales_yachts' },
  { name: 'photo-descriptor', path: '/sales_yachts' },
] as const

for (const target of SECTIONS) {
  test(`the ${target.name} section matches its baseline`, async ({ page }) => {
    await page.goto(pathFor(target.path, 'en'))
    const section = page.locator(`[data-section="${target.name}"]`)
    await expect(section).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    await hideFloatingHeader(page)
    await hideDevOverlay(page)

    // The scroll comes first: a picture that has not been near the screen has not been fetched.
    await section.scrollIntoViewIfNeeded()
    await waitForPhotos(section)

    await expect(section).toHaveScreenshot(`${target.name}.png`)
  })
}
