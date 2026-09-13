import { expect, test } from '@playwright/test'

import { ENABLED_LOCALES, pathFor } from './routes'

/**
 * The 404 page (issue #56). The legacy site had none: an unknown path showed Next's unstyled
 * default, in English, with no way back (`docs/legacy-inventory.md` section 2.5). The status
 * itself is asserted in pages.e2e.spec.ts; what matters here is what the visitor is given.
 */
test.describe('not found', () => {
  test('speaks the language of the URL it was reached through', async ({ page }) => {
    const titles: string[] = []

    for (const locale of ENABLED_LOCALES) {
      await page.goto(pathFor('/no-such-page', locale))
      titles.push(await page.getByRole('heading', { level: 1 }).innerText())
    }

    expect(new Set(titles).size).toBe(ENABLED_LOCALES.length)
  })

  for (const locale of ENABLED_LOCALES) {
    test(`offers a way back to the ${locale} home page`, async ({ page }) => {
      await page.goto(pathFor('/no-such-page', locale))

      await page.getByRole('link').first().click()

      await expect(page).toHaveURL(new RegExp(`/${locale}$`))
    })
  }
})
