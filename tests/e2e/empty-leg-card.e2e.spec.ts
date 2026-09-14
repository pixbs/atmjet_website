import { expect, test } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The empty leg card (issue #104, `docs/legacy-inventory.md` section 6). The card carries no
 * state of its own, so what is worth asserting is that a page renders it rather than a client
 * painting it afterwards, and that the three legs of the fixture print what they should.
 */
const SECTION = '[data-section="empty-legs"]'

test.describe('the empty leg card', () => {
  test('is in the HTML the server sends, prices and all', async ({ request }) => {
    // The legacy card declared itself a client component and `async` at the same time, which
    // React does not support; this one is rendered on the server (ADR-0007).
    const html = await (await request.get(pathFor('/styleguide', 'en'))).text()

    expect(html).toContain('data-section="empty-legs"')
    expect(html).toContain('March 5, 2026')
    expect(html).toContain('$12,000')
    expect(html).toContain('$30,000')
    expect(html).toContain('-60%')
  })

  test('reads the route from the airport and its code', async ({ page }) => {
    await page.goto(pathFor('/styleguide', 'en'))
    const section = page.locator(SECTION)

    await expect(section.getByText('Dubai(OMDB)')).toBeVisible()
    await expect(section.getByText('Paris Le Bourget(LFPB)')).toBeVisible()
  })

  test('keeps a leg whose code matched no airport, showing the code alone', async ({ page }) => {
    await page.goto(pathFor('/styleguide', 'en'))

    // The legacy section dropped such a row, so the route disappeared from the page (E4.7).
    await expect(page.locator(SECTION).getByText('UUWW', { exact: true })).toBeVisible()
  })

  test('says so rather than showing a price a leg does not have', async ({ page }) => {
    await page.goto(pathFor('/styleguide', 'en'))
    const unpriced = page.locator(SECTION).getByText('N/A')

    await expect(unpriced).toBeVisible()
    // No struck-through figure and no badge where there is nothing to discount.
    await expect(page.locator(SECTION).getByText('-60%')).toHaveCount(2)
  })

  test('opens the booking dialog on the page the visitor is reading', async ({ page }) => {
    await page.goto(pathFor('/styleguide', 'en'))

    const booking = page.locator(SECTION).getByRole('link').first()
    await expect(booking).toHaveAttribute('href', '?showBooking=Empty-legs')
  })
})
