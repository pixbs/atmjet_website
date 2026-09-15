import { expect, test } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The two sections that invite a booking (issue #115, `docs/legacy-inventory.md` section 5): a
 * heading over the flight request form, plainly or in a card, and the same form in a card with
 * a photograph across the top of it.
 */
const BOOKING = '[data-section="make-booking"]'
const TRANSFER = '[data-section="transfer"]'

test.describe('the booking invitation', () => {
  test('is in the HTML the server sends, with the form under its heading', async ({ request }) => {
    const html = await (await request.get(pathFor('/group_charters', 'en'))).text()

    expect(html).toContain('data-section="make-booking"')
    expect(html).toContain('Book a flight')
    // The form is the one client island in it, server-rendered like everything else (ADR-0007).
    expect(html).toContain('data-section="request-form"')
  })

  test('draws the card the legacy `isCard` drew, and leaves the plain one plain', async ({
    page,
  }) => {
    await page.goto(pathFor('/citizens', 'en'))
    const card = page.locator(BOOKING)
    await expect(card).toHaveAttribute('data-variant', 'card')
    await expect(card.locator('[class*="bg-graphite-850"]')).toHaveCount(1)

    await page.goto(pathFor('/group_charters', 'en'))
    const plain = page.locator(BOOKING)
    await expect(plain).toHaveAttribute('data-variant', 'plain')
    await expect(plain.locator('[class*="bg-graphite-850"]')).toHaveCount(0)
  })

  test('hands its legs to the booking dialog, as the form does anywhere else', async ({ page }) => {
    await page.goto(pathFor('/group_charters', 'en'))
    const form = page.locator(BOOKING).locator('[data-section="request-form"]')
    await form.getByRole('combobox', { name: 'From' }).first().fill('Dubai (OMDB)')
    await page.locator('#leg-0-date').fill('2026-10-01')

    await form.getByRole('button', { name: 'Request Quote' }).first().click()

    await expect(page).toHaveURL(/\?showBooking=Flight_request&direction=/)
  })

  test('says it in the language of the page', async ({ request }) => {
    const html = await (await request.get(pathFor('/group_charters', 'ru'))).text()

    expect(html).toContain('Забронировать перелет')
    expect(html).not.toContain('Book a flight')
  })
})

test.describe('the transfer', () => {
  test('is in the HTML the server sends, with its photograph and the form', async ({ request }) => {
    const html = await (await request.get(pathFor('/business_agents', 'en'))).text()

    expect(html).toContain('data-section="transfer"')
    expect(html).toContain('Get VIP airport transfer as a gift from us')
    expect(html).toContain('data-section="request-form"')
  })

  test('draws the photograph the editor uploaded', async ({ page }) => {
    await page.goto(pathFor('/business_agents', 'en'))
    const photo = page.locator(TRANSFER).locator('img')

    await expect(photo).toHaveCount(1)
    await expect(photo).toHaveJSProperty('complete', true)
  })

  test('says it in the language of the page', async ({ request }) => {
    const html = await (await request.get(pathFor('/business_agents', 'ru'))).text()

    expect(html).toContain('Получите VIP-трансфер из аэропорта в подарок')
    expect(html).not.toContain('Get VIP airport transfer')
  })
})
