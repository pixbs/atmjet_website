import { forEachLocale, test } from '../e2e/fixtures'
import { pathFor } from '../e2e/routes'
import { expectNoA11yViolations } from './axe'

/**
 * The two subpages that are a hero, one section and the contact card (issues #144 and #146).
 * A whole page rather than a component: what a section passes on its own it can still fail
 * beside another, and these are the first two pages ported end to end.
 */
const SLUGS = ['cargo_charter', 'medical_aviation'] as const

forEachLocale((locale) => {
  for (const slug of SLUGS) {
    test(`/${slug} has no blocking accessibility violations`, async ({ page }) => {
      await page.goto(pathFor(`/${slug}`, locale))
      await page.locator('[data-section="contact-us"]').waitFor()

      await expectNoA11yViolations(page)
    })
  }
})
