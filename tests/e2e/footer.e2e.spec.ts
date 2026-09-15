import { expect, test, type Page } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The foot of every page (issue #89, `docs/legacy-inventory.md` section 3.4): where each of its
 * links goes, in the language the page is read in.
 *
 * The legacy footer hard-coded its twelve pages and its three accounts, which is how the site
 * came to carry a Telegram link written as `tg:\\nesolve?domain=@atmjet1` (section 9.5); every
 * href here is built from what an editor keeps in the Footer global and the site settings.
 */
const SECTION = '[data-section="footer"]'

const footerOf = (page: Page) => page.locator(SECTION)

test.describe('the footer', () => {
  test('is in the HTML the server sends, links and legal lines alike', async ({ request }) => {
    // A footer that appears on hydration is one a crawler never follows.
    const html = await (await request.get(pathFor('/styleguide', 'en'))).text()

    expect(html).toContain('data-section="footer"')
    expect(html).toContain('Cargo charter')
    expect(html).toContain('Dubai +971 (50) 458-99-26')
  })

  test('opens the pages an editor put in it, in the language being read', async ({ page }) => {
    await page.goto(pathFor('/styleguide', 'ru'))
    const footer = footerOf(page)

    await expect(footer.getByRole('link', { name: 'Грузовые перевозки' })).toHaveAttribute(
      'href',
      '/ru/cargo_charter',
    )
    await expect(footer.getByRole('link', { name: 'Главная' })).toHaveAttribute('href', '/ru')
  })

  test('reaches ATM JET where the site settings say it does', async ({ page }) => {
    await page.goto(pathFor('/styleguide', 'en'))
    const footer = footerOf(page)

    // Built by `src/lib/links.ts` from a bare handle, so no editor ever types a scheme.
    await expect(footer.getByRole('link', { name: 'Telegram' })).toHaveAttribute(
      'href',
      'https://t.me/melentev1',
    )
    await expect(footer.getByRole('link', { name: 'WhatsApp' })).toHaveAttribute(
      'href',
      'https://wa.me/971504589926',
    )
    await expect(footer.getByRole('link', { name: 'Instagram' })).toHaveAttribute(
      'href',
      'https://www.instagram.com/atmjet/',
    )
  })

  test('opens the booking dialog on the page it is read on', async ({ page }) => {
    await page.goto(pathFor('/styleguide', 'en'))

    // The query is the whole of the href, as the legacy `?showBooking=Footer` link was.
    await expect(footerOf(page).getByRole('link', { name: 'Make a booking' })).toHaveAttribute(
      'href',
      '?showBooking=Footer',
    )
  })

  test('says the year the page is read in, where the legacy left a placeholder', async ({
    page,
  }) => {
    await page.goto(pathFor('/styleguide', 'en'))

    await expect(footerOf(page).getByText(/^©ATM JET, 2004-/)).toHaveText(
      `©ATM JET, 2004-${new Date().getFullYear()}. All rights reserved`,
    )
  })
})
