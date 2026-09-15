import { forEachLocale, test } from '../e2e/fixtures'
import { pathFor } from '../e2e/routes'
import { expectNoA11yViolations } from './axe'

/**
 * The floating menu of the home page (issue #94). The legacy put the click on the icon itself,
 * so the menu could only be opened with a pointer and nothing announced whether it was open;
 * this is the check that the button that replaced it reads as one.
 */
forEachLocale((locale) => {
  test('the open floating menu has no blocking accessibility violations', async ({ page }) => {
    await page.goto(pathFor('/', locale))
    await page
      .locator('[data-section="angle-bar"]')
      .getByRole('button', { name: /menu|меню/i })
      .click()

    await expectNoA11yViolations(page)
  })
})
