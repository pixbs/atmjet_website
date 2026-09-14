import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'
import { hideFloatingHeader } from './chrome'

/**
 * The subpage hero as the legacy drew it (issue #112, `docs/legacy-inventory.md` section 5).
 * Two captures, because the four pages that use it come in two shapes: with the sentence under
 * the heading, and — on the citizens page — without.
 */
const SECTION = '[data-section="hero-subpage"]'

for (const page of [
  { slug: 'cargo_charter', name: 'hero-subpage.png' },
  { slug: 'citizens', name: 'hero-subpage-no-subtitle.png' },
]) {
  test(`the ${page.slug} hero matches its baseline`, async ({ page: browserPage }) => {
    await browserPage.goto(pathFor(`/${page.slug}`, 'en'))
    const hero = browserPage.locator(SECTION)
    await expect(hero).toBeVisible()
    await browserPage.evaluate(() => document.fonts.ready)
    await hideFloatingHeader(browserPage)

    await expect(hero).toHaveScreenshot(page.name)
  })
}
