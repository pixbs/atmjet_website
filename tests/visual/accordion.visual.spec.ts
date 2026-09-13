import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'

/**
 * The accordion open and closed (issue #106). The closed state is part of the styleguide
 * screenshot; this pins the height the open answer takes, which is what the legacy animation
 * ended on and what a change to the motion vocabulary would move.
 */
test('accordion matches its baseline when a question is opened', async ({ page }) => {
  await page.goto(pathFor('/styleguide', 'en'))
  const section = page.locator('[data-section="accordion"]')
  await expect(section).toBeVisible()
  await page.evaluate(() => document.fonts.ready)

  await page.getByRole('button', { name: 'The second question' }).click()
  await expect(page.getByText('Opening this one closes the other')).toBeVisible()

  await expect(section).toHaveScreenshot('accordion-open.png')
})
