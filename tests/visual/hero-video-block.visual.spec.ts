import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'
import { hideDevOverlay, hideFloatingHeader } from './chrome'

/**
 * The video hero (issue #111, `docs/legacy-inventory.md` section 5): the words centred on a
 * screen the film fills, with the caption in its corner. Both viewports, because the words are
 * centred in a screen whose shape decides where they break.
 *
 * The film is stopped at its first frame before the shutter opens; where the file is not there
 * yet (E11.6, issue #175) the poster is what the screen holds, and either is the same picture
 * every run.
 */
const SECTION = '[data-section="hero-video"]'

const VIEWPORTS = {
  mobile: { width: 390, height: 844 },
  desktop: { width: 1440, height: 900 },
} as const

for (const [name, size] of Object.entries(VIEWPORTS)) {
  test(`the video hero matches its baseline at ${name} width`, async ({ page }) => {
    await page.setViewportSize(size)
    await page.goto(pathFor('/group_charters', 'en'))
    const section = page.locator(SECTION)
    await expect(section).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    await hideFloatingHeader(page)
    await hideDevOverlay(page)

    await section.locator('video').evaluate(
      (film: HTMLVideoElement) =>
        new Promise<void>((resolve) => {
          film.pause()
          film.currentTime = 0
          // The poster is a fetch of its own, and nothing else on the page waits for it.
          const picture = new Image()
          picture.onload = picture.onerror = () => resolve()
          picture.src = film.poster
        }),
    )

    await expect(section).toHaveScreenshot(`hero-video-${name}.png`)
  })
}
