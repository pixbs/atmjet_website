import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'

/**
 * The gallery as the legacy site drew it (issue #101, `docs/legacy-inventory.md` section 6): the
 * large photo above a strip of thumbnails, the one showing at full strength and the rest dimmed.
 *
 * One clip over all three shapes the fixture draws — one photo, four, and a strip long enough to
 * scroll — because what the issue asks to see is how the grid behaves as the count grows.
 */
test('the gallery matches its baseline at one, four and many photos', async ({ page }) => {
  await page.goto(pathFor('/styleguide', 'en'))
  const section = page.locator('[data-section="gallery"]')
  await expect(section).toBeVisible()
  await page.evaluate(() => document.fonts.ready)

  // The photos are uploads and load lazily, so a capture taken before they arrive is a capture
  // of empty boxes.
  await section.scrollIntoViewIfNeeded()
  const photos = section.locator('img')
  await expect(photos.first()).toBeVisible()
  for (const photo of await photos.all()) {
    await expect(photo).toHaveJSProperty('complete', true)
  }

  await expect(section).toHaveScreenshot('gallery.png')
})
