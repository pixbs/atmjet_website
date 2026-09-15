import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'
import { hideHeroVideo } from './chrome'

/**
 * Visual parity example. Every ported section and page adds a screenshot test
 * against the legacy baseline (E2.1/E2.2). Baselines live next to the spec in
 * __screenshots__ and are generated on Linux only.
 */
test('home page matches its baseline', async ({ page }) => {
  await page.goto(pathFor('/', 'en'))
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await hideHeroVideo(page)

  await expect(page).toHaveScreenshot('home.png', { fullPage: true })
})
