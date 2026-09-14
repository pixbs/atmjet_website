import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'
import { hideFloatingHeader } from './chrome'

/**
 * The privileges section (issue #120, `docs/legacy-inventory.md` section 5): the heading beside
 * the stack of privileges, each icon in gold on its own panel.
 *
 * A clip of the screen taken from the section's own corner rather than from the screen's: the
 * section is taller than the viewport, so where it comes to rest depends on what is above it
 * and what is captured must not. The scroll is `instant` because the parity layer carries the
 * legacy `scroll-smooth`.
 */
const SECTION = '[data-section="privilege"]'

/** The heading and the stack, from the top; the invitation, from the bottom. */
const HEIGHT = 600
const PANEL = 340

test('the privileges section matches its baseline', async ({ page }) => {
  await page.goto(pathFor('/atm_jet_group', 'en'))
  const section = page.locator(SECTION)
  await expect(section).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await hideFloatingHeader(page)

  await section.evaluate((element) =>
    window.scrollTo({
      top: element.getBoundingClientRect().top + window.scrollY,
      behavior: 'instant',
    }),
  )

  const box = await section.boundingBox()
  expect(box).not.toBeNull()
  expect(box!.y + HEIGHT).toBeLessThanOrEqual(page.viewportSize()!.height)

  await expect(page).toHaveScreenshot('privilege-section.png', {
    clip: { x: box!.x, y: box!.y, width: box!.width, height: HEIGHT },
  })
})

test('the invitation under the privileges matches its baseline', async ({ page }) => {
  await page.goto(pathFor('/atm_jet_group', 'en'))
  const section = page.locator(SECTION)
  await expect(section).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await hideFloatingHeader(page)

  // The end of the section at the end of the screen, so the panel is the last thing on it.
  await section.evaluate((element) =>
    window.scrollTo({
      top: element.getBoundingClientRect().bottom + window.scrollY - window.innerHeight,
      behavior: 'instant',
    }),
  )

  const box = await section.boundingBox()
  expect(box).not.toBeNull()
  // Clipped from the section's own foot, so nothing above it can move what is captured.
  await expect(page).toHaveScreenshot('privilege-contact.png', {
    clip: { x: box!.x, y: box!.y + box!.height - PANEL, width: box!.width, height: PANEL },
  })
})
