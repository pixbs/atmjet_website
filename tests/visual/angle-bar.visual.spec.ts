import { expect, test, type Page } from '@playwright/test'

import { pathFor } from '../e2e/routes'
import { hideDevOverlay, hideHeroVideo } from './chrome'

/**
 * The floating button and the panel it opens (issue #94, `docs/legacy-inventory.md` section
 * 3.5): the plane in its own faint circle, and the white panel with the accounts, the booking
 * button and the language links.
 *
 * Open in both languages, because Russian has one link in it that English has no wording for.
 * The hero behind it is hidden: a frame of a video is never the same twice.
 */
const SECTION = '[data-section="angle-bar"]'

/** Room around the panel, so its rounded corners are in the frame. */
const MARGIN = 8

async function home(page: Page, locale: 'en' | 'ru') {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(pathFor('/', locale))
  await expect(page.locator(SECTION)).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await hideHeroVideo(page)
  await hideDevOverlay(page)
}

test('the floating button matches its baseline', async ({ page }) => {
  await home(page, 'en')

  await expect(page.locator(SECTION)).toHaveScreenshot('angle-bar-closed.png')
})

for (const locale of ['en', 'ru'] as const) {
  test(`the open menu matches its baseline in ${locale}`, async ({ page }) => {
    await home(page, locale)
    const bar = page.locator(SECTION)
    await bar.getByRole('button', { name: /menu|меню/i }).click()

    // The panel hangs above the strip the button sits in, and is not inside the element the
    // section is, so the clip is the two of them together.
    const panel = bar.locator('div[class*="rounded-2xl"]')
    await expect(panel).toBeVisible()
    const button = (await bar.boundingBox())!
    const open = (await panel.boundingBox())!
    const top = Math.min(button.y, open.y)

    await expect(page).toHaveScreenshot(`angle-bar-open-${locale}.png`, {
      clip: {
        x: open.x - MARGIN,
        y: top - MARGIN,
        width: button.x + button.width - open.x + MARGIN,
        height: button.y + button.height - top + MARGIN * 2,
      },
    })
  })
}
