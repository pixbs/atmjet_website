import { forEachLocale, test } from '../e2e/fixtures'
import { pathFor } from '../e2e/routes'
import { expectNoA11yViolations } from './axe'

/**
 * The subpages that are their sections and nothing else (issues #144, #146 and #143).
 * A whole page rather than a component: what a section passes on its own it can still fail
 * beside another, and these are the first two pages ported end to end.
 */
const SLUGS = ['cargo_charter', 'medical_aviation', 'empty_legs'] as const

forEachLocale((locale) => {
  for (const slug of SLUGS) {
    test(`/${slug} has no blocking accessibility violations`, async ({ page }) => {
      await page.goto(pathFor(`/${slug}`, locale))
      await page.locator('[data-section="contact-us"]').waitFor()

      await expectNoA11yViolations(page)
    })
  }
})
