import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'
import { hideFloatingHeader, waitForPhotos } from './chrome'

/**
 * The guide and the documents (issue #131, `docs/legacy-inventory.md` section 4): the page
 * heading over two columns, and the document cards side by side under them.
 *
 * Clips of the screen taken from each section's own corner rather than from the screen's, so
 * what is captured cannot move when a section above it changes. The scrolls are `instant`
 * because the parity layer carries the legacy `scroll-smooth`.
 */
const SECTIONS = [
  { name: 'guide', selector: '[data-section="guide"]', height: 620 },
  // Shorter: the documents are the last section of the page, so their top can only rise so far.
  { name: 'documents', selector: '[data-section="documents"]', height: 420 },
]

for (const section of SECTIONS) {
  test(`the ${section.name} section matches its baseline`, async ({ page }) => {
    await page.goto(pathFor('/business_agents', 'en'))
    const located = page.locator(section.selector)
    await expect(located).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    await hideFloatingHeader(page)

    // The scroll comes first: a picture that has not been near the screen has not been fetched.
    const toTheTop = () =>
      located.evaluate((element) =>
        window.scrollTo({
          top: element.getBoundingClientRect().top + window.scrollY,
          behavior: 'instant',
        }),
      )

    await toTheTop()
    await waitForPhotos(located)
    await toTheTop()

    const box = await located.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.y + section.height).toBeLessThanOrEqual(page.viewportSize()!.height)

    await expect(page).toHaveScreenshot(`${section.name}-section.png`, {
      clip: { x: box!.x, y: box!.y, width: box!.width, height: section.height },
    })
  })
}
