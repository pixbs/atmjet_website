import { expect, forEachLocale, test } from '../e2e/fixtures'
import { expectNoA11yViolations } from './axe'

/**
 * The phone field with its country list open (issue #108). The legacy list was an unnamed `ul`
 * that scrolled: nothing said a list of countries had appeared, and a screen reader following
 * the arrow keys was never told which row they were on.
 */
forEachLocale(() => {
  test('the open country list has no blocking accessibility violations', async ({ styleguide }) => {
    await styleguide.goto()
    const section = styleguide.page.locator('[data-section="phone"]')

    await section.getByRole('textbox', { name: 'Phone' }).scrollIntoViewIfNeeded()
    await section.getByRole('button').click()
    await expect(section.getByRole('listbox')).toBeVisible()

    await expectNoA11yViolations(styleguide.page)
  })
})
