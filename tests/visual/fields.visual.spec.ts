import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'

/**
 * The form primitives as the legacy site drew them (issue #96, `docs/legacy-inventory.md`
 * section 6): the white panel with its label above the value, and the tick box in both states.
 * A section clip rather than a page, because only these three elements are the subject.
 */
test('the form fields match their baseline', async ({ page }) => {
  await page.goto(pathFor('/styleguide', 'en'))
  const section = page.locator('[data-section="fields"]')
  await expect(section).toBeVisible()
  await page.evaluate(() => document.fonts.ready)

  await expect(section).toHaveScreenshot('fields.png')
})
