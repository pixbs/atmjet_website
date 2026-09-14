import { expect, forEachLocale, test } from '../e2e/fixtures'
import { expectNoA11yViolations } from './axe'

/**
 * The airport field with its list open (issue #107). The legacy one was a plain `ul` of `li`
 * with a click handler: nothing said a list had appeared, nothing said which entry was current,
 * and there was no way in from the keyboard. This is the check that keeps that from coming back.
 */
forEachLocale(() => {
  test('the open airport list has no blocking accessibility violations', async ({ styleguide }) => {
    await styleguide.goto()
    const field = styleguide.page
      .locator('[data-section="autocomplete"]')
      .getByRole('combobox', { name: 'From' })

    await field.scrollIntoViewIfNeeded()
    await field.fill('dub')
    await expect(styleguide.page.getByRole('listbox')).toBeVisible()

    await expectNoA11yViolations(styleguide.page)
  })
})
