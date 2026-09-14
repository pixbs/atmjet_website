import { forEachLocale, test } from '../e2e/fixtures'
import { expectNoA11yViolations } from './axe'

/**
 * The open menu (issue #88) covers the viewport and is the first thing on the site a visitor
 * meets with a keyboard, so it is checked open rather than closed: the button has to say what
 * it does and what state it is in, and the links under the blur have to keep their contrast.
 */
forEachLocale(() => {
  test('the open menu has no blocking accessibility violations', async ({ header }) => {
    await header.goto()
    await header.open()

    await expectNoA11yViolations(header.page)
  })
})
