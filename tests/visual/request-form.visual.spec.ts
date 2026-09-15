import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'
import { hideDevOverlay, hideFloatingHeader } from './chrome'

/**
 * The flight request (issue #151, `docs/legacy-inventory.md` section 7.1): four fields in one
 * rounded box, the toggle and the two ways to submit.
 *
 * Both viewports, because the leg stacks into a column on a narrow screen and the submit button
 * that is drawn changes with it; and the round trip, because it is a fifth field and one fewer
 * button.
 */
const SECTION = '[data-section="request-form-example"]'

const VIEWPORTS = {
  mobile: { width: 390, height: 844 },
  desktop: { width: 1440, height: 900 },
} as const

for (const [name, size] of Object.entries(VIEWPORTS)) {
  test(`the flight request matches its baseline at ${name} width`, async ({ page }) => {
    await page.setViewportSize(size)
    await page.goto(pathFor('/styleguide', 'en'))
    const section = page.locator(SECTION)
    await section.scrollIntoViewIfNeeded()
    await expect(section).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    await hideFloatingHeader(page)
    await hideDevOverlay(page)

    await expect(section).toHaveScreenshot(`request-form-${name}.png`)
  })
}

test('the round trip matches its baseline', async ({ page }) => {
  await page.setViewportSize(VIEWPORTS.desktop)
  await page.goto(pathFor('/styleguide', 'en'))
  const section = page.locator(SECTION)
  await section.scrollIntoViewIfNeeded()
  await page.evaluate(() => document.fonts.ready)
  await hideFloatingHeader(page)
  await hideDevOverlay(page)

  await section.getByRole('button', { name: 'Round trip' }).click()
  await expect(section.getByText('Return')).toBeVisible()

  await expect(section).toHaveScreenshot('request-form-round-trip.png')
})
