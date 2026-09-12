import { expect, test } from '@playwright/test'

/**
 * The parity base layer (issue #48) has no single legacy page to compare against: the ported
 * sections do that in E6-E8. This spec pins the fixture page that renders every global rule,
 * so a change to the base layer or to a token shows up as a diff here first.
 */
test('styleguide matches its baseline', async ({ page }) => {
  await page.goto('/styleguide')
  await expect(page.getByRole('heading', { level: 1, name: 'Heading one' })).toBeVisible()
  await page.evaluate(() => document.fonts.ready)

  await expect(page).toHaveScreenshot('styleguide.png', { fullPage: true })
})
