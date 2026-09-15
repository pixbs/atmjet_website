import { expect, forEachLocale, test } from '../e2e/fixtures'
import { pathFor } from '../e2e/routes'
import { expectNoA11yViolations } from './axe'

/**
 * The booking dialog (issue #93). The legacy one was a `<section>` with a click handler: nothing
 * told a screen reader it was a dialog, Escape did nothing, and the focus stayed on the page
 * behind it. This is the check that none of that comes back.
 */
forEachLocale((locale) => {
  test('the open dialog has no blocking accessibility violations', async ({ page }) => {
    await page.goto(`${pathFor('/empty_legs', locale)}?showBooking=Header`)
    const dialog = page.locator('[data-section="booking-dialog"]')
    await expect(dialog).toBeVisible()

    await expectNoA11yViolations(page)
  })
})
