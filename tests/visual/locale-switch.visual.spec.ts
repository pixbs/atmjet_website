import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'

/**
 * The language links as the legacy switcher drew them (issue #90,
 * `docs/legacy-inventory.md` section 3.6): side by side at the base size, the one being read
 * dimmed. The chrome that will hold them arrives in E6.1; this pins the element itself.
 */
test('the language links match their baseline', async ({ page }) => {
  await page.goto(pathFor('/styleguide', 'ru'))
  const section = page.locator('[data-section="locale-switch"]')
  await expect(section).toBeVisible()
  await page.evaluate(() => document.fonts.ready)

  await expect(section.locator('a[aria-current="true"]')).toHaveText('Рус')

  await expect(section).toHaveScreenshot('locale-switch.png')
})
