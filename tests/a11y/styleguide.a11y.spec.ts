import { forEachLocale, test } from '../e2e/fixtures'
import { expectNoA11yViolations } from './axe'

/**
 * The parity fixture page (issue #48) renders the global element rules with real form
 * controls, so it is the first page where a contrast or label regression in the base layer
 * would show up.
 */
forEachLocale(() => {
  test('styleguide has no blocking accessibility violations', async ({ styleguide }) => {
    await styleguide.goto()
    await expectNoA11yViolations(styleguide.page)
  })
})
