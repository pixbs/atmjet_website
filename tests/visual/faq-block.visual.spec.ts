import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'
import { hideFloatingHeader } from './chrome'

/**
 * The FAQ section (issue #123, `docs/legacy-inventory.md` section 5): the heading in its own
 * column beside the questions, the first answer open.
 *
 * A clip of the screen taken from the section's own corner rather than from the screen's, so
 * what is captured cannot move when a section above it changes. The scroll is `instant` because
 * the parity layer carries the legacy `scroll-smooth`.
 */
const SECTION = '[data-section="faq"]'

/** The heading, the open answer and the questions under it. */
const HEIGHT = 520

test('the FAQ section matches its baseline', async ({ page }) => {
  await page.goto(pathFor('/', 'en'))
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

  await expect(page).toHaveScreenshot('faq-section.png', {
    clip: { x: box!.x, y: box!.y, width: box!.width, height: HEIGHT },
  })
})
