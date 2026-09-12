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

    test('reveals the card when it is scrolled into view', async ({ styleguide }) => {
      await styleguide.goto()

      // Out of view the reveal has not run, so the card is still transparent.
      await expect(styleguide.revealedCard).toHaveCSS('opacity', '0')

      await styleguide.revealedCard.scrollIntoViewIfNeeded()

      await expect(styleguide.revealedCard).toHaveCSS('opacity', '1')
    })

    test('counts the numbers up once they are on screen', async ({ styleguide }) => {
      await styleguide.goto()
      await styleguide.counter.scrollIntoViewIfNeeded()

      await expect(styleguide.counter).toHaveText('20+')
    })
  })
})
