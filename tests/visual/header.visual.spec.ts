import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'

/**
 * The chrome as the legacy site drew it (issue #88, `docs/legacy-inventory.md` sections 3.2 and
 * 3.3). The legacy captures of the open menu are of the home page, which has no sections yet,
 * so the comparison against them belongs with the home page of E8.1; these are living baselines
 * of the same states on the fixture page.
 *
 * Both viewports, because the menu is the one part of the chrome that is laid out differently
 * on each: two columns side by side on a wide screen, stacked on a narrow one. Both languages
 * for the open menu, because every word in it comes from the Header global.
 */
const VIEWPORTS = {
  mobile: { width: 390, height: 844 },
  desktop: { width: 1440, height: 900 },
} as const

test.describe('the header bar', () => {
  for (const [name, size] of Object.entries(VIEWPORTS)) {
    test(`matches its baseline at ${name} width`, async ({ page }) => {
      await page.setViewportSize(size)
      await page.goto(pathFor('/styleguide', 'en'))
      const bar = page.locator('[data-section="header"]')
      await expect(bar).toBeVisible()
      await page.evaluate(() => document.fonts.ready)

      await expect(bar).toHaveScreenshot(`header-${name}.png`)
    })
  }
})

test.describe('the open menu', () => {
  for (const [name, size] of Object.entries(VIEWPORTS)) {
    for (const locale of ['en', 'ru'] as const) {
      test(`matches its baseline at ${name} width in ${locale}`, async ({ page }) => {
        await page.setViewportSize(size)
        await page.goto(pathFor('/styleguide', locale))
        await page.getByRole('button', { name: /menu|меню/i }).click()

        const menu = page.locator('[data-section="navbar"]')
        await expect(menu).toBeVisible()
        await page.evaluate(() => document.fonts.ready)

        await expect(menu).toHaveScreenshot(`menu-${name}-${locale}.png`)
      })
    }
  }
})
