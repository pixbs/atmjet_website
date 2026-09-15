import { expect, test, type Page } from '@playwright/test'

import { pathFor } from '../e2e/routes'
import { hideDevOverlay } from './chrome'

/**
 * The cookie banner and the settings behind it (issue #91, `docs/legacy-inventory.md` section
 * 3.7): the message with its link and three buttons, and the panel with a row per category.
 *
 * Both languages, because every word in them is content and the message is a paragraph long.
 */
// A visitor who has not been asked yet, which every other spec is spared (see playwright.config.ts).
test.use({ storageState: { cookies: [], origins: [] } })

const BANNER = '[data-section="cookie-banner"]'
const MODAL = '[data-section="cookie-modal"]'

async function asked(page: Page, locale: 'en' | 'ru') {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(pathFor('/styleguide', locale))
  await expect(page.locator(BANNER)).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await hideDevOverlay(page)
}

for (const locale of ['en', 'ru'] as const) {
  test(`the cookie banner matches its baseline in ${locale}`, async ({ page }) => {
    await asked(page, locale)

    await expect(page.locator(BANNER)).toHaveScreenshot(`cookie-banner-${locale}.png`)
  })
}

test('the cookie settings match their baseline', async ({ page }) => {
  await asked(page, 'en')
  await page.locator(BANNER).getByRole('button', { name: 'Customize' }).click()
  await expect(page.locator(MODAL)).toBeVisible()

  await expect(page.locator(MODAL)).toHaveScreenshot('cookie-modal.png')
})
