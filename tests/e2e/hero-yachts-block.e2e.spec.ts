import { expect, test } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The yachts hero as a block (issue #114, `docs/legacy-inventory.md` section 5). The legacy
 * section took an `isButtonHidden` prop for the charter page; here a hero with no wording on
 * its button simply has no button, and both pages draw the same block.
 */
const SECTION = '[data-section="hero-yachts"]'

test.describe('the yachts hero', () => {
  test('is in the HTML the server sends, on the page that sells yachts', async ({ request }) => {
    const html = await (await request.get(pathFor('/sales_yachts', 'en'))).text()

    expect(html).toContain('data-section="hero-yachts"')
    expect(html).toContain('Yacht Sales')
    expect(html).toContain('Get a quote')
  })

  test('offers the booking dialog where the page asks for it', async ({ page }) => {
    await page.goto(pathFor('/sales_yachts', 'en'))

    await expect(page.locator(SECTION).getByRole('link', { name: 'Get a quote' })).toHaveAttribute(
      'href',
      '?showBooking=Hero_yachts',
    )
  })

  test('draws no button on a page that gave it no wording', async ({ page }) => {
    await page.goto(pathFor('/yachts', 'en'))
    const section = page.locator(SECTION)

    await expect(section).toBeVisible()
    await expect(section.getByRole('link')).toHaveCount(0)
    // The charter hero is the one with a second paragraph under the first.
    await expect(section.locator('p')).toContainText([
      'ATM JET',
      'ATM JET Yachts is proud to offer the largest fleet of superyachts for charter',
      'Our extensive network of owners and operators',
    ])
  })

  test('speaks the language of the page it is on', async ({ request }) => {
    const html = await (await request.get(pathFor('/yachts', 'ru'))).text()

    expect(html).toContain('ATM JET Yachts предлагает в аренду самый большой флот яхт')
    expect(html).not.toContain('ATM JET Yachts is proud to offer')
  })
})
