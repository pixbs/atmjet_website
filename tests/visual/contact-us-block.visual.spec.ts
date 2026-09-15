import { expect, test, type Locator } from '@playwright/test'

import { pathFor } from '../e2e/routes'
import { hideDevOverlay, hideFloatingHeader } from './chrome'

/**
 * The contact section every legacy page ended with (issue #129, `docs/legacy-inventory.md`
 * section 5). Both widths, because the two messenger cards stack and the form and the contact
 * card go from two thirds and one third to one above the other.
 */
const SECTION = '[data-section="contact-us"]'

/** The four blocks, which `motion` reveals by writing an inline opacity on each. */
const blocksOf = (section: Locator) => section.locator('[style*="opacity"]')

/**
 * Each block reveals when half of it has been reached, and `once` keeps it where it arrived.
 * The section is taller than a narrow screen, so the shot walks it past the screen before the
 * shutter opens — and waits at each end, because the observer reports after the scroll rather
 * than during it, and a second jump in the same task would be all it ever saw.
 */
async function revealed(section: Locator) {
  const blocks = blocksOf(section)

  for (const [position, block] of [
    ['end', blocks.last()],
    ['start', blocks.first()],
  ] as const) {
    await section.evaluate(
      (element, to) => element.scrollIntoView({ block: to, behavior: 'instant' }),
      position,
    )
    await expect(block).toHaveCSS('opacity', '1')
  }

  await expect
    .poll(() =>
      section.evaluate((element) =>
        [...element.querySelectorAll<HTMLElement>('[style*="opacity"]')].every(
          (node) => getComputedStyle(node).opacity === '1',
        ),
      ),
    )
    .toBe(true)
}

for (const width of [390, 1280]) {
  test(`the contact section matches its baseline at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(pathFor('/cargo_charter', 'en'))
    const section = page.locator(SECTION)
    await expect(section).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    await hideFloatingHeader(page)
    await hideDevOverlay(page)

    await revealed(section)

    await expect(section).toHaveScreenshot(`contact-us-${width}.png`)
  })
}
