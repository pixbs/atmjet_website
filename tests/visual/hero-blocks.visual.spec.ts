import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'
import { hideDevOverlay, hideFloatingHeader, waitForPhotos } from './chrome'

/**
 * The two full-screen heroes (issues #113 and #114, `docs/legacy-inventory.md` section 5): the
 * photograph under the darkening gradient, the words over it, and the button where the page
 * asks for one. This tier runs with reduced motion, so what is captured is where the headline
 * comes to rest.
 */
const HEROES = [
  { name: 'hero-sales', path: '/sales_dept' },
  { name: 'hero-yachts', path: '/sales_yachts' },
] as const

for (const hero of HEROES) {
  test(`the ${hero.name} section matches its baseline`, async ({ page }) => {
    await page.goto(pathFor(hero.path, 'en'))
    const section = page.locator(`[data-section="${hero.name}"]`)
    await expect(section).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    await hideFloatingHeader(page)
    await hideDevOverlay(page)
    await waitForPhotos(section)

    // The hero is the first screen of the page, so the screen is the section.
    const box = await section.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.y).toBe(0)

    await expect(page).toHaveScreenshot(`${hero.name}.png`, {
      clip: { x: box!.x, y: 0, width: box!.width, height: page.viewportSize()!.height },
    })
  })
}
