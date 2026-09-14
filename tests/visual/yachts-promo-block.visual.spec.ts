import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'
import { hideFloatingHeader, waitForPhotos } from './chrome'

/**
 * The yachts promotion (issue #121, `docs/legacy-inventory.md` section 5): the centred heading
 * over the card, its banner and the three columns under it.
 *
 * A clip of the screen taken from the section's own corner rather than from the screen's: the
 * section is taller than the viewport, so where it comes to rest depends on what is above it
 * and what is captured must not. The scroll is `instant` because the parity layer carries the
 * legacy `scroll-smooth`.
 */
const SECTION = '[data-section="yachts-promo"]'

/**
 * The heading, the sentence and the head of the card, which is what the section adds; the card
 * itself has its own baseline (issue #103). The placeholder upload is 16:9 rather than the wide
 * strip a real banner is, so it fills most of this.
 */
const HEIGHT = 600

test('the yachts promotion matches its baseline', async ({ page }) => {
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

  await expect(page).toHaveScreenshot('yachts-promo.png', {
    clip: { x: box!.x, y: box!.y, width: box!.width, height: HEIGHT },
  })
})
