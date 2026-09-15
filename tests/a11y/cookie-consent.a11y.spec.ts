import { forEachLocale, test } from '../e2e/fixtures'
import { pathFor } from '../e2e/routes'
import { expectNoA11yViolations, type Exemption } from './axe'

// A visitor who has not been asked yet, which every other spec is spared (see playwright.config.ts).
test.use({ storageState: { cookies: [], origins: [] } })

/**
 * The cookie banner and the settings panel (issue #91). The legacy panel was a `<section>` that
 * nothing announced as a dialog and that a keyboard could not leave; this is the check on what
 * replaced it.
 */

/**
 * The legacy banner drew its one link as white words inside a grey paragraph, with nothing but
 * the colour to tell them apart (`docs/legacy-inventory.md` section 3.7). Underlining it would
 * change what the section draws, which parity does not allow on its own; the page it opens is
 * itself an open decision (E3.11, issue #57), and this is where that decision belongs.
 */
const LEGACY_LINK: Exemption[] = [
  {
    rule: 'link-in-text-block',
    selector: 'privacy',
    reason: 'The legacy banner distinguished its privacy link by colour alone (section 3.7).',
  },
]
forEachLocale((locale) => {
  test('the cookie question has no blocking accessibility violations', async ({ page }) => {
    await page.goto(pathFor('/styleguide', locale))
    await page.locator('[data-section="cookie-banner"]').waitFor()

    await expectNoA11yViolations(page, { allow: LEGACY_LINK })
  })

  test('the open cookie settings have no blocking accessibility violations', async ({ page }) => {
    await page.goto(pathFor('/styleguide', locale))
    await page
      .locator('[data-section="cookie-banner"]')
      .getByRole('button', { name: /customize|настроить/i })
      .click()
    await page.locator('[data-section="cookie-modal"]').waitFor()

    await expectNoA11yViolations(page, { allow: LEGACY_LINK })
  })
})
