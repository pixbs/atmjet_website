import { expect, test } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The best price section as a block (issue #125, `docs/legacy-inventory.md` section 5): the
 * words and the button come from the document, and the button carries the query the booking
 * dialog of E6.6 opens on.
 */
const SECTION = '[data-section="best-price"]'

test.describe('the best price section', () => {
  test('is in the HTML the server sends, words and button alike', async ({ request }) => {
    const html = await (await request.get(pathFor('/business_agents', 'en'))).text()

    expect(html).toContain('data-section="best-price"')
    expect(html).toContain('Best price assurance')
    expect(html).toContain('Contact us')
  })

  test('asks for the booking dialog without leaving the page', async ({ page }) => {
    await page.goto(pathFor('/business_agents', 'en'))
    const link = page.locator(SECTION).getByRole('link', { name: 'Contact us' })

    // The legacy link was the query alone, so the dialog opens over the page being read.
    await expect(link).toHaveAttribute('href', '?showBooking=Best_price')
  })

  test('speaks the language of the page it is on', async ({ request }) => {
    const html = await (await request.get(pathFor('/business_agents', 'ru'))).text()

    expect(html).toContain('Гарантия лучшей цены')
    expect(html).not.toContain('Best price assurance')
  })
})
