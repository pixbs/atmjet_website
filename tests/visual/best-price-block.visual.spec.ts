import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'
import { hideDevOverlay, hideFloatingHeader, waitForPhotos } from './chrome'

/**
 * The best price section (issue #125, `docs/legacy-inventory.md` section 5): the gold heading,
 * the sentence and the button on one side of the card, the photograph on the other.
 *
 * A clip of the screen taken from the section's own corner rather than from the screen's, so
 * what is captured cannot move when a section above it changes.
 */
const SECTION = '[data-section="best-price"]'

/** The card and the space above it; the section ends in a margin nothing is drawn in. */
const HEIGHT = 400

test('the best price section matches its baseline', async ({ page }) => {
  await page.goto(pathFor('/business_agents', 'en'))
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

  await expect(page).toHaveScreenshot('best-price.png', {
    clip: { x: box!.x, y: box!.y, width: box!.width, height: HEIGHT },
  })
})
