import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'

/**
 * The preloader as the legacy site drew it (issue #92, `docs/legacy-inventory.md` section 3.8):
 * the wordmark centred on the dark backdrop.
 *
 * The static variant is the one pinned: it holds its first frame rather than playing, so it
 * renders the same under the reduced motion this tier runs with.
 */
test('the preloader matches its baseline', async ({ page }) => {
  await page.goto(pathFor('/styleguide/preloader', 'en'))
  await expect(page.getByTestId('preloader-backdrop')).toBeVisible()
  await page.evaluate(() => document.fonts.ready)

  await expect(page).toHaveScreenshot('preloader.png')
})
