import { expect, test } from '@playwright/test'

import { ENABLED_LOCALES, pathFor } from '../e2e/routes'
import { hideDevOverlay, hideFloatingHeader, settlePage } from './chrome'

/**
 * The subpages that are their sections and nothing else, whole (issues #144, #146, #143,
 * #150, #147, #145 and #148).
 * Their sections have baselines of their own; this is the page around them — the order,
 * the spacing between sections and the gutter — in both languages, because the words are what
 * decides how tall each section grows.
 */
const SLUGS = [
  'aircraft',
  'cargo_charter',
  'medical_aviation',
  'empty_legs',
  'atm_jet_group',
  'business_agents',
  'group_charters',
  'partners',
  'sales_dept',
  'sales_yachts',
] as const

const VIEWPORTS = {
  mobile: { width: 390, height: 844 },
  desktop: { width: 1280, height: 900 },
} as const

for (const slug of SLUGS) {
  for (const locale of ENABLED_LOCALES) {
    for (const [name, size] of Object.entries(VIEWPORTS)) {
      test(`/${slug} matches its baseline in ${locale} at ${name} width`, async ({ page }) => {
        await page.setViewportSize(size)
        await page.goto(pathFor(`/${slug}`, locale))
        // The footer, because it is under every section whatever the page is made of.
        await page.locator('[data-section="footer"]').waitFor()
        await page.evaluate(() => document.fonts.ready)
        await hideFloatingHeader(page)
        await hideDevOverlay(page)

        await settlePage(page)

        await expect(page).toHaveScreenshot(`${slug}-${locale}-${name}.png`, { fullPage: true })
      })
    }
  }
}
