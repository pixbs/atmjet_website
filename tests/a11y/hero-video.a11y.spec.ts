import { forEachLocale, test } from '../e2e/fixtures'
import { pathFor } from '../e2e/routes'
import { expectNoA11yViolations } from './axe'

/**
 * The page the video hero opens (issue #111). The legacy hero carried a `<track>` pointing at a
 * file that was never there (`docs/legacy-inventory.md` section 13, entry 14); this is the check
 * that dropping it left a silent, decorative film that nothing has to read out.
 */
forEachLocale((locale) => {
  test('the video hero leaves no blocking accessibility violations', async ({ page }) => {
    await page.goto(pathFor('/group_charters', locale))

    await expectNoA11yViolations(page)
  })
})
