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
    expect(html).toContain('A yacht bought the way an aircraft is')
    expect(html).toContain('Ask about a yacht')
  })

  test('offers the booking dialog where the page asks for it', async ({ page }) => {
    await page.goto(pathFor('/sales_yachts', 'en'))

    await expect(
      page.locator(SECTION).getByRole('link', { name: 'Ask about a yacht' }),
    ).toHaveAttribute('href', '?showBooking=Hero_yachts')
  })

  test('draws no button on a page that gave it no wording', async ({ page }) => {
    await page.goto(pathFor('/yachts', 'en'))
    const section = page.locator(SECTION)

    await expect(section).toBeVisible()
    await expect(section.getByRole('link')).toHaveCount(0)
    // The charter hero is the one with a second paragraph under the first.
    await expect(section.locator('p')).toContainText([
      'Yacht charter',
      'Motor and sailing yachts from 20 to 100 metres, crewed and provisioned.',
      'Berths, permits and the transfer from the airport are arranged here.',
    ])
  })

  test('speaks the language of the page it is on', async ({ request }) => {
    const html = await (await request.get(pathFor('/yachts', 'ru'))).text()

    expect(html).toContain('Неделя, которая следует за перелётом')
    expect(html).not.toContain('The week that follows the flight')
  })
})
