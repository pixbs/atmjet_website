import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'
import { hideFloatingHeader, waitForPhotos } from './chrome'

/**
 * The advantages section (issue #128, `docs/legacy-inventory.md` section 5): the heading over
 * the panel, the panoramic photograph across it and the three columns under that.
 *
 * A clip of the screen taken from the section's own corner rather than from the screen's, so
 * what is captured cannot move when a section above it changes. This tier runs with reduced
 * motion, so what is captured is where the reveal comes to rest.
 */
const SECTION = '[data-section="advantages"]'

/** The heading, the photograph and the columns. */
const HEIGHT = 600

test('the advantages section matches its baseline', async ({ page }) => {
  await page.goto(pathFor('/sales_dept', 'en'))
  const section = page.locator(SECTION)
  await expect(section).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await hideFloatingHeader(page)

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

  await expect(page).toHaveScreenshot('advantages.png', {
    clip: { x: box!.x, y: box!.y, width: box!.width, height: HEIGHT },
  })
})
