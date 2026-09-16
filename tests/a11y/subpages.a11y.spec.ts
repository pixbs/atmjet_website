import { forEachLocale, test } from '../e2e/fixtures'
import { pathFor } from '../e2e/routes'
import { expectNoA11yViolations } from './axe'

/**
 * The subpages that are their sections and nothing else (issues #144, #146, #143, #150, #147,
 * #145 and #148).
 * A whole page rather than a component: what a section passes on its own it can still fail
 * beside another, and these are the pages ported end to end.
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
  'yachts',
  // One yacht, reached the way the listing card reaches it (issue #140).
  'yachts/azimut-serenity',
] as const

forEachLocale((locale) => {
  // The citizens page answers in Russian alone (issue #149), so it is checked in that language.
  for (const slug of locale === 'ru' ? [...SLUGS, 'citizens'] : SLUGS) {
    test(`/${slug} has no blocking accessibility violations`, async ({ page }) => {
      await page.goto(pathFor(`/${slug}`, locale))
      // The footer, because it is under every section whatever the page is made of.
      await page.locator('[data-section="footer"]').waitFor()

      await expectNoA11yViolations(page)
    })
  }
})
