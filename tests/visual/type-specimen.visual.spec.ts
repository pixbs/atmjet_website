import { expect, test } from '@playwright/test'

import { pathFor, ENABLED_LOCALES } from '../e2e/routes'

/**
 * The type specimen (issue #51): both faces at the sizes the site sets them, in both alphabets.
 *
 * A living baseline rather than a legacy one: the legacy site had no such page, and the Cyrillic
 * half of it is the owner's decision of 2026-09-13 to load the subset the legacy left out, so
 * there is nothing on the legacy site to compare it against.
 */
for (const locale of ENABLED_LOCALES) {
  test(`type specimen [${locale}]`, async ({ page }) => {
    await page.goto(pathFor('/styleguide/type', locale))
    await page.evaluate(() => document.fonts.ready)

    await expect(page.locator('[data-section="type-specimen"]')).toHaveScreenshot(
      `type-specimen-${locale}.png`,
    )
  })
}
