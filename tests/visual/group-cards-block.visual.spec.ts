import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'
import { hideFloatingHeader, waitForPhotos } from './chrome'

/**
 * The group cards (issue #130, `docs/legacy-inventory.md` section 4): the photographs fading
 * out under the copy, one card above the other inside one clipped box.
 *
 * A clip of the screen taken from the section's own corner rather than from the screen's, so
 * what is captured cannot move when a section above it changes. The scroll is `instant` because
 * the parity layer carries the legacy `scroll-smooth`.
 */
const SECTION = '[data-section="group-cards"]'

/** Both cards and the rule between them. */
const HEIGHT = 600

test('the group cards match their baseline', async ({ page }) => {
  await page.goto(pathFor('/atm_jet_group', 'en'))
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

  await expect(page).toHaveScreenshot('group-cards.png', {
    clip: { x: box!.x, y: box!.y, width: box!.width, height: HEIGHT },
  })
})
