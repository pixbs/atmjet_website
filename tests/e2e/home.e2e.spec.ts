import { expect, test } from '@playwright/test'

test.describe('Home', () => {
  test('is rendered on the server', async ({ request }) => {
    const response = await request.get('/')

    expect(response.status()).toBe(200)
    // The heading must be part of the HTML the server sends, not painted by the client.
    expect(await response.text()).toContain('Welcome to your new project.')
  })

  test('shows the placeholder content and links', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/ATM JET/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Welcome to your new project.')
    await expect(page.getByRole('link', { name: 'Go to admin panel' })).toHaveAttribute(
      'href',
      '/admin',
    )
  })
})
