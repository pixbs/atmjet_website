import { forEachLocale, test } from '../e2e/fixtures'
import { expectNoA11yViolations } from './axe'

forEachLocale(() => {
  test('home page has no blocking accessibility violations', async ({ home }) => {
    await home.goto()
    await expectNoA11yViolations(home.page)
  })
})
