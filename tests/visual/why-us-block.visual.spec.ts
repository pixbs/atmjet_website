import { expect, test, type Locator } from '@playwright/test'

import { pathFor } from '../e2e/routes'
import { hideFloatingHeader, waitForPhotos } from './chrome'

/**
 * The "why us" section (issue #116, `docs/legacy-inventory.md` section 5): the heading in a
 * column of its own beside the stack of reasons.
 *
 * The cards have their own baselines (issue #102); this is the section around them, a capture
 * of the screen because the section is taller than it. That the heading then stays where it is
 * while the stack scrolls past is behaviour, and its own end-to-end test. The scroll is counted
 * from the section, so nothing added to the page above it can move this capture, and it is
 * `instant` because the parity layer carries the legacy `scroll-smooth`.
 */
const SECTION = '[data-section="why-us"]'

const scrollTo = (section: Locator, offset: number) =>
  section.evaluate(
    (element, top) =>
      window.scrollTo({
        top: element.getBoundingClientRect().top + window.scrollY - top,
        behavior: 'instant',
      }),
    offset,
  )

test('the why us section matches its baseline', async ({ page }) => {
  await page.goto(pathFor('/cargo_charter', 'en'))
  const section = page.locator(SECTION)
  await expect(section).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await hideFloatingHeader(page)

  // The scroll comes first: a picture that has not been near the screen has not been fetched.
  await scrollTo(section, 100)
  await waitForPhotos(section)
  await scrollTo(section, 100)
  await expect.poll(async () => Math.round((await section.boundingBox())?.y ?? -1)).toBe(100)

  await expect(page).toHaveScreenshot('why-us-section.png')
})
