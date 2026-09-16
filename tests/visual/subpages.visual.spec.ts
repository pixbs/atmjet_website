import { expect, test } from '@playwright/test'

import { ENABLED_LOCALES, pathFor, type Locale } from '../e2e/routes'
import { hideDevOverlay, hideFloatingHeader, settlePage } from './chrome'

/**
 * The subpages that are their sections and nothing else, whole (issues #144, #146, #143,
 * #150, #147, #145 and #148).
 * Their sections have baselines of their own; this is the page around them — the order,
 * the spacing between sections and the gutter — in both languages, because the words are what
 * decides how tall each section grows.
 */
const PAGES: { slug: string; locales: readonly Locale[] }[] = [
  { slug: 'aircraft', locales: ENABLED_LOCALES },
  { slug: 'cargo_charter', locales: ENABLED_LOCALES },
  { slug: 'medical_aviation', locales: ENABLED_LOCALES },
  { slug: 'empty_legs', locales: ENABLED_LOCALES },
  { slug: 'atm_jet_group', locales: ENABLED_LOCALES },
  { slug: 'business_agents', locales: ENABLED_LOCALES },
  { slug: 'group_charters', locales: ENABLED_LOCALES },
  { slug: 'partners', locales: ENABLED_LOCALES },
  { slug: 'sales_dept', locales: ENABLED_LOCALES },
  { slug: 'sales_yachts', locales: ENABLED_LOCALES },
  // The citizens page answers in Russian alone (issue #149), so there is one capture of it.
  { slug: 'citizens', locales: ['ru'] },
]

const VIEWPORTS = {
  mobile: { width: 390, height: 844 },
  desktop: { width: 1280, height: 900 },
} as const

for (const { slug, locales } of PAGES) {
  for (const locale of locales) {
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
