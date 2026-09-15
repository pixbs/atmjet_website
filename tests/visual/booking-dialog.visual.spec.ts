import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'
import { hideDevOverlay } from './chrome'

/**
 * The dialog every booking button opens (issue #93, `docs/legacy-inventory.md` section 3.9):
 * the panel over the blurred page, the form in it, the three accounts and the number.
 *
 * Both viewports, because the panel keeps the page gutter and the form's fields stack. The
 * whole screen rather than the panel: the backdrop and the blur behind it are half of what the
 * dialog is.
 */
const VIEWPORTS = {
  mobile: { width: 390, height: 844 },
  desktop: { width: 1280, height: 900 },
} as const

for (const [name, size] of Object.entries(VIEWPORTS)) {
  test(`the booking dialog matches its baseline at ${name} width`, async ({ page }) => {
    await page.setViewportSize(size)
    await page.goto(`${pathFor('/empty_legs', 'en')}?showBooking=Header`)
    const dialog = page.locator('[data-section="booking-dialog"]')
    await expect(dialog).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    await hideDevOverlay(page)

    // The panel fades in; the shot waits for it to arrive rather than for a moment of it.
    await expect(dialog).toHaveCSS('opacity', '1')

    await expect(page).toHaveScreenshot(`booking-dialog-${name}.png`)
  })
}
