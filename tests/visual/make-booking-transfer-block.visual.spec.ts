import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'
import { hideDevOverlay, hideFloatingHeader, waitForPhotos } from './chrome'

/**
 * The two sections that carry the flight request (issue #115, `docs/legacy-inventory.md`
 * section 5). Both variants of the invitation, because the card is the whole of the difference
 * between them, and both widths, because the transfer puts its photograph above the heading on
 * a narrow screen and beside it on a wide one.
 */
const CASES = [
  {
    name: 'make-booking-plain',
    path: '/group_charters',
    locale: 'en',
    section: '[data-section="make-booking"]',
  },
  // The card variant is on the citizens page, which answers in Russian alone (issue #149).
  {
    name: 'make-booking-card',
    path: '/citizens',
    locale: 'ru',
    section: '[data-section="make-booking"]',
  },
  {
    name: 'transfer',
    path: '/business_agents',
    locale: 'en',
    section: '[data-section="transfer"]',
  },
] as const

for (const { name, path, locale, section: selector } of CASES) {
  for (const width of [390, 1280]) {
    test(`the ${name} section matches its baseline at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(pathFor(path, locale))
      const section = page.locator(selector)
      await expect(section).toBeVisible()
      await page.evaluate(() => document.fonts.ready)
      await hideFloatingHeader(page)
      await hideDevOverlay(page)

      await section.scrollIntoViewIfNeeded()
      await waitForPhotos(section)

      await expect(section).toHaveScreenshot(`${name}-${width}.png`)
    })
  }
}
