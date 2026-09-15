import { expect, test } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The empty legs section (issue #117, `docs/legacy-inventory.md` section 5): the flights the
 * collection holds, in the order an editor put them, and the card that opens the channel the
 * new ones are posted to.
 */
const SECTION = '[data-section="empty-legs"]'

test.describe('the empty legs section', () => {
  test('is in the HTML the server sends, flights and all', async ({ request }) => {
    const html = await (await request.get(pathFor('/empty_legs', 'en'))).text()

    expect(html).toContain('data-section="empty-legs"')
    expect(html).toContain('Flights leaving soon')
    // The route as the card prints it: the airport the leg relates to, then its code.
    expect(html).toContain('Dubai, United Arab Emirates(OMDB)')
    expect(html).toContain('$12,000')
  })

  test('lists the flights in the order an editor put them', async ({ request }) => {
    const html = await (await request.get(pathFor('/empty_legs', 'en'))).text()
    // One code per flight, in the order the fixture gives them: the legacy section read the
    // table unordered and ignored the column an editor dragged (section 8.3).
    const positions = ['(OMDB)', '(UUWW)', '(LSGG)'].map((code) => html.indexOf(code))

    expect(positions.every((at) => at > -1)).toBe(true)
    expect(positions).toEqual([...positions].sort((first, second) => first - second))
  })

  test('draws a flight the admin never priced without inventing one', async ({ page }) => {
    await page.goto(pathFor('/empty_legs', 'en'))
    const section = page.locator(SECTION)

    // The third flight has no price and an arrival no airport matches.
    await expect(section).toContainText('N/A')
    await expect(section).toContainText('ZZZZ')
  })

  test('opens the booking dialog from a card without leaving the page', async ({ page }) => {
    await page.goto(pathFor('/empty_legs', 'en'))

    await expect(
      page.locator(SECTION).getByRole('link', { name: 'Make a booking' }).first(),
    ).toHaveAttribute('href', '?showBooking=Empty-legs')
  })

  test('opens the Telegram channel with a link a browser can follow', async ({ page }) => {
    await page.goto(pathFor('/empty_legs', 'en'))

    // The legacy href was `tg:\\nesolve?domain=@atmjet1` (section 13, entry 54).
    await expect(
      page.locator(SECTION).getByRole('link', { name: 'Open the channel' }),
    ).toHaveAttribute('href', 'https://t.me/atmjet1')
  })

  test('speaks the language of the page it is on, airports included', async ({ request }) => {
    const html = await (await request.get(pathFor('/empty_legs', 'ru'))).text()

    expect(html).toContain('Ближайшие перелёты')
    expect(html).toContain('Дубай, ОАЭ(OMDB)')
    expect(html).not.toContain('Flights leaving soon')
  })
})
