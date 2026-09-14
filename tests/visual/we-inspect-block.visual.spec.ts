import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'
import { hideDevOverlay, hideFloatingHeader, waitForPhotos } from './chrome'

/**
 * The inspection section (issue #126, `docs/legacy-inventory.md` section 5): the heading and
 * the row of cards as it rests on the first of them, running into the gutter as the legacy row
 * did. The gold line under them has no width until they move, so it is the e2e that pins it.
 *
 * A clip of the screen taken from the section's own corner rather than from the screen's, so
 * what is captured cannot move when a section above it changes.
 */
const SECTION = '[data-section="we-inspect"]'

/** The heading, the cards, and the strip below them the line is drawn in. */
const HEIGHT = 510

test('the we inspect section matches its baseline', async ({ page }) => {
  await page.goto(pathFor('/sales_yachts', 'en'))
  const section = page.locator(SECTION)
  await expect(section).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await hideFloatingHeader(page)
  await hideDevOverlay(page)

  // The scroll comes first: a picture that has not been near the screen has not been fetched.
  const toTheTop = () =>
    section.evaluate((element) =>
      window.scrollTo({
        top: element.getBoundingClientRect().top + window.scrollY,
        behavior: 'instant',
      }),
    )

  await toTheTop()
  await waitForPhotos(section)
  await toTheTop()

  const box = await section.boundingBox()
  expect(box).not.toBeNull()
  expect(box!.y + HEIGHT).toBeLessThanOrEqual(page.viewportSize()!.height)

  await expect(page).toHaveScreenshot('we-inspect.png', {
    clip: { x: box!.x, y: box!.y, width: box!.width, height: HEIGHT },
  })
})
