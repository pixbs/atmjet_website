import { expect, test } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The contact card (issue #133, `docs/legacy-inventory.md` section 4): the last of the aircraft
 * listing's own sections. The words are in the markup the server sends; the picture behind them
 * is darkened by three passes of the same gradient, as the legacy darkened it.
 */
const SECTION = '[data-section="contact-card"]'

test.describe('the contact card', () => {
  test('is in the HTML the server sends, words and button alike', async ({ request }) => {
    const html = await (await request.get(pathFor('/aircraft', 'en'))).text()

    expect(html).toContain('data-section="contact-card"')
    expect(html).toContain('Please contact us to request a selection of the five most suitable')
    expect(html).toContain('Contact now')
  })

  test('asks for the booking dialog without leaving the page', async ({ page }) => {
    await page.goto(pathFor('/aircraft', 'en'))

    await expect(page.locator(SECTION).getByRole('link', { name: 'Contact now' })).toHaveAttribute(
      'href',
      '?showBooking=Contact_us_aircraft',
    )
  })

  test('keeps its picture inside the card it belongs to', async ({ page }) => {
    await page.goto(pathFor('/aircraft', 'en'))
    const card = page.locator(`${SECTION} .card`)
    await card.scrollIntoViewIfNeeded()
    const picture = await card.locator('img').boundingBox()
    const box = await card.boundingBox()

    expect(picture).not.toBeNull()
    expect(box).not.toBeNull()
    // The legacy pinned this picture to the screen instead; issue #303 has the measurement.
    expect(picture!.width).toBeLessThanOrEqual(box!.width)
    expect(picture!.height).toBeLessThanOrEqual(box!.height)
  })

  test('speaks the language of the page it is on', async ({ request }) => {
    const html = await (await request.get(pathFor('/aircraft', 'ru'))).text()

    expect(html).toContain('Оставить контакты')
    expect(html).not.toContain('Contact now')
  })
})
