import { expect, forEachLocale, test } from './fixtures'

forEachLocale(() => {
  test.describe('Home', () => {
    test('is rendered on the server', async ({ home, request }) => {
      await home.expectServerRendered(request, 'Welcome to your new project.')
    })

    test('shows the placeholder content and links', async ({ home, page }) => {
      await home.goto()

      await expect(page).toHaveTitle(/ATM JET/)
      await expect(home.heading).toHaveText('Welcome to your new project.')
      await expect(home.adminLink).toHaveAttribute('href', '/admin')
    })
  })
})
