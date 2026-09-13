import { expect, test } from '@playwright/test'

import { ENABLED_LOCALES, pathFor } from './routes'

/**
 * Locale routing in the browser (issue #52, ADR-0003). The unit tests pin the configuration;
 * these pin what a visitor and a crawler actually get back.
 */
test.describe('locale routing', () => {
  test('redirects the bare root to the default locale', async ({ page }) => {
    const response = await page.goto('/')

    expect(new URL(page.url()).pathname).toBe('/en')
    expect(response?.status()).toBe(200)
  })

  for (const locale of ENABLED_LOCALES) {
    test(`serves ${locale} under its own prefix`, async ({ page, request }) => {
      const path = pathFor('/', locale)
      const response = await request.get(path)

      expect(response.status()).toBe(200)

      await page.goto(path)
      expect(new URL(page.url()).pathname).toBe(path)
      await expect(page.locator('html')).toHaveAttribute('lang', locale)
    })
  }

  test('keeps the prefix on a nested route', async ({ page }) => {
    await page.goto(pathFor('/styleguide', 'ru'))

    expect(new URL(page.url()).pathname).toBe('/ru/styleguide')
    await expect(page.locator('html')).toHaveAttribute('lang', 'ru')
    await expect(page.getByRole('heading', { level: 1, name: 'Heading one' })).toBeVisible()
  })

  test('does not route a locale that is not enabled', async ({ request }) => {
    // `uk` is entered in the admin but not enabled in SiteSettings (issue #53), so the proxy
    // reads the segment as an ordinary path and it answers 404, as the legacy site did.
    const response = await request.get('/uk', { maxRedirects: 5 })

    expect(response.status()).toBe(404)
  })

  test('returns 404 for an unknown locale prefix', async ({ request }) => {
    const response = await request.get('/de', { maxRedirects: 5 })

    expect(response.status()).toBe(404)
  })

  test('leaves the Payload admin outside locale routing', async ({ page }) => {
    await page.goto('/admin')

    // The admin redirects to its own login, never to a locale prefix.
    expect(new URL(page.url()).pathname).not.toMatch(/^\/(en|ru)\b/)
    expect(new URL(page.url()).pathname.startsWith('/admin')).toBe(true)
  })

  test('leaves the API outside locale routing', async ({ request }) => {
    const response = await request.get('/api/access', { maxRedirects: 0 })

    expect(response.status()).toBe(200)
  })
})
