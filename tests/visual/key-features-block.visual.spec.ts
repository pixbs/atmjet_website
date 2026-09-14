import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'
import { hideFloatingHeader, waitForPhotos } from './chrome'

/**
 * The key features section (issue #118, `docs/legacy-inventory.md` section 5): the heading in
 * gold on the dark band, the first photographs of the carousel beside it and the arrows over
 * their top right corner.
 *
 * A clip of the screen taken from the section's own corner rather than from the screen's: the
 * section is taller than the viewport and sits at the end of the page, so where it comes to
 * rest depends on what is above it, and what is captured must not. The scroll is `instant`
 * because the parity layer carries the legacy `scroll-smooth`.
 */
const SECTION = '[data-section="key-features"]'

/** The heading, the first photographs and the arrows over them; the rest is the carousel. */
const HEIGHT = 600

test('the key features section matches its baseline', async ({ page }) => {
  await page.goto(pathFor('/medical_aviation', 'en'))
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

  await expect(page).toHaveScreenshot('key-features-section.png', {
    clip: { x: box!.x, y: box!.y, width: box!.width, height: HEIGHT },
  })
})
