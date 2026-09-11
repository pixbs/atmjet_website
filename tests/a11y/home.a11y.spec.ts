import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/** Accessibility smoke check (WCAG 2.1 A/AA rules). Advisory in CI, blocking locally. */
test('home page has no detectable accessibility violations', async ({ page }) => {
  await page.goto('/')

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()

  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
})
