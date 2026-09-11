import { expect, test } from '@playwright/test'

/**
 * Visual parity example. Every ported section and page adds a screenshot test
 * against the legacy baseline (E2.1/E2.2). Baselines live next to the spec in
 * __screenshots__ and are generated on Linux only.
 */
test('home page matches its baseline', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

  await expect(page).toHaveScreenshot('home.png', { fullPage: true })
})
