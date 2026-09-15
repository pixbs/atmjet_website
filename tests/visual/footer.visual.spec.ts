import { expect, test } from '@playwright/test'

import { ENABLED_LOCALES, pathFor } from '../e2e/routes'
import { hideDevOverlay } from './chrome'

/**
 * The foot of every page (issue #89, `docs/legacy-inventory.md` section 3.4): the wordmark and
 * the language links over two rows of pages, the accounts beside them, the booking button and
 * the legal lines, on the photograph the page ends on.
 *
 * Both viewports, because the rows sit side by side on a wide screen and stack on a narrow one,
 * and both languages, because every word in it is content.
 */
const SECTION = '[data-section="footer"]'

const VIEWPORTS = {
  mobile: { width: 390, height: 844 },
  desktop: { width: 1440, height: 900 },
} as const

for (const [name, size] of Object.entries(VIEWPORTS)) {
  for (const locale of ENABLED_LOCALES) {
    test(`the footer matches its baseline at ${name} width in ${locale}`, async ({ page }) => {
      await page.setViewportSize(size)
      await page.goto(pathFor('/styleguide', locale))

      const section = page.locator(SECTION)
      await section.scrollIntoViewIfNeeded()
      await expect(section).toBeVisible()
      await page.evaluate(() => document.fonts.ready)
      await hideDevOverlay(page)

      // The photograph loads when the foot of the page is reached, and the panel over it is
      // translucent, so a capture taken before it arrives is of a different footer.
      const photo = section.locator('img')
      await expect(photo).toHaveJSProperty('complete', true)

      await expect(section).toHaveScreenshot(`footer-${name}-${locale}.png`)
    })
  }
}
