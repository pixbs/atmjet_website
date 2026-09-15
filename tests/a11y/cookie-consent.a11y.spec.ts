import { forEachLocale, test } from '../e2e/fixtures'
import { pathFor } from '../e2e/routes'
import { expectNoA11yViolations } from './axe'

// A visitor who has not been asked yet, which every other spec is spared (see playwright.config.ts).
test.use({ storageState: { cookies: [], origins: [] } })

/**
 * The cookie banner and the settings panel (issue #91). The legacy panel was a `<section>` that
 * nothing announced as a dialog and that a keyboard could not leave; this is the check on what
 * replaced it.
 */

forEachLocale((locale) => {
  test('the cookie question has no blocking accessibility violations', async ({ page }) => {
    await page.goto(pathFor('/styleguide', locale))
    await page.locator('[data-section="cookie-banner"]').waitFor()

    await expectNoA11yViolations(page)
  })

  test('the open cookie settings have no blocking accessibility violations', async ({ page }) => {
    await page.goto(pathFor('/styleguide', locale))
    await page
      .locator('[data-section="cookie-banner"]')
      .getByRole('button', { name: /customize|настроить/i })
      .click()
    await page.locator('[data-section="cookie-modal"]').waitFor()

    await expectNoA11yViolations(page)
  })
})
