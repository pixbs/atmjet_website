import { expect, forEachLocale, test } from './fixtures'

/**
 * The parity fixture page (issue #48) renders every legacy global rule; these checks keep it
 * server-rendered and reachable, so the visual spec always compares a real page.
 */
forEachLocale(() => {
  test.describe('Styleguide', () => {
    test('is rendered on the server', async ({ styleguide, request }) => {
      await styleguide.expectServerRendered(request, 'Heading one')
    })

    test('shows every group of the parity layer', async ({ styleguide }) => {
      await styleguide.goto()

      await expect(styleguide.heading).toBeVisible()
      await expect(styleguide.cardHeading).toBeVisible()
      await expect(styleguide.middleButton).toBeVisible()
      await expect(styleguide.page.getByRole('textbox', { name: 'Dark input' })).toBeVisible()
    })
  })
})
