import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'
import { hideDevOverlay, hideFloatingHeader, waitForPhotos } from './chrome'

/**
 * The four page-local heroes (issue #133, `docs/legacy-inventory.md` section 4). Each section
 * is captured on its own: they open their pages, so a screen clip would be the same picture
 * with the rest of the screen around it.
 */
const HEROES = [
  { name: 'hero-aircraft', path: '/aircraft' },
  { name: 'hero-empty-legs', path: '/empty_legs' },
  { name: 'hero-partners', path: '/partners' },
  { name: 'hero-group', path: '/atm_jet_group' },
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

    await expect(section).toHaveScreenshot(`${hero.name}.png`)
  })
}
