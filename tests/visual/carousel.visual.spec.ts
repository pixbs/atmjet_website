import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'

/**
 * The carousel on its first slide (issue #98, `docs/legacy-inventory.md` section 6): the arrows
 * with the previous one disabled, the dots with the first one gold, and the progress bar empty.
 * A section clip, because the slides themselves are a fixture and the controls are the subject.
 */
test('the carousel matches its baseline on the first slide', async ({ page }) => {
  await page.goto(pathFor('/styleguide', 'en'))
  const section = page.locator('[data-section="carousel"]')
  await expect(section).toBeVisible()
  await page.evaluate(() => document.fonts.ready)

  // The dots are drawn from the slide count embla reports, so they arrive on hydration.
  await expect(section.getByRole('tab', { name: '1' })).toHaveAttribute('aria-selected', 'true')

  await expect(section).toHaveScreenshot('carousel.png')
})
