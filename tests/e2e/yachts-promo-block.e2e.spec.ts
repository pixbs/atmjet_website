import { expect, test } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The yachts promotion as a block (issue #121, `docs/legacy-inventory.md` section 5). What the
 * section adds to the card is the heading over it and where the invitation leads: the block
 * names a page, and the page's slug decides the URL, so a renamed page cannot leave a dead
 * link behind (the legacy hard-coded `/yachts` and reached it through a redirect).
 */
const SECTION = '[data-section="yachts-promo"]'

test.describe('the yachts promotion', () => {
  test('is in the HTML the server sends, heading and columns', async ({ request }) => {
    const html = await (await request.get(pathFor('/atm_jet_group', 'en'))).text()

    expect(html).toContain('data-section="yachts-promo"')
    expect(html).toContain('Yacht sales and charter, welcome to our yachts in Dubai and Europe.')
    expect(html).toContain('We have access to over 3000 luxury yachts worldwide.')
  })

  test('opens the page the block points at, in the language of the page it is on', async ({
    page,
  }) => {
    await page.goto(pathFor('/atm_jet_group', 'en'))

    await expect(page.locator(SECTION).getByRole('link', { name: 'Request now' })).toHaveAttribute(
      'href',
      '/en/yachts',
    )

    await page.goto(pathFor('/atm_jet_group', 'ru'))

    await expect(
      page.locator(SECTION).getByRole('link', { name: 'Оставить заявку' }),
    ).toHaveAttribute('href', '/ru/yachts')
  })
})
