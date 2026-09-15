import type { Page } from '@playwright/test'

import { testUser } from '../helpers/seedUser'
import { expect, test } from './fixtures'
import { pathFor } from './routes'

/**
 * The dialog every booking button on the site opens (issue #93, `docs/legacy-inventory.md`
 * sections 3.9 and 7.5): the query that opens it, the four ways to close it, and the button it
 * came from travelling into the lead.
 */
const DIALOG = '[data-section="booking-dialog"]'

const dialogOf = (page: Page) => page.locator(DIALOG)

/** Unique, so a run can find its own lead in a list every run adds to. */
const visitor = () => `A caller ${Date.now().toString(36)}`

/**
 * A browser fills three fields in faster than any person. Issue #157 puts a floor under that in
 * the server action, so the wait is here already and this spec needs no change when it lands.
 */
const asAVisitor = (page: Page) => page.waitForTimeout(2_500)

test.describe('the booking dialog', () => {
  test('is not on a page nothing opened it on', async ({ page }) => {
    await page.goto(pathFor('/empty_legs', 'en'))

    await expect(dialogOf(page)).toHaveCount(0)
  })

  test('opens on the query, whichever button wrote it', async ({ page }) => {
    // Any value at all opens it; the thirteen the legacy site used are listed in section 7.5.
    for (const source of ['Header', 'Footer', 'Empty-legs']) {
      await page.goto(`${pathFor('/empty_legs', 'en')}?showBooking=${source}`)

      await expect(dialogOf(page)).toBeVisible()
      await expect(dialogOf(page).locator('[data-section="booking-form"]')).toBeVisible()
    }
  })

  test('opens from the button the page itself draws', async ({ page }) => {
    await page.goto(pathFor('/empty_legs', 'en'))
    await page.locator('[data-section="footer"]').getByRole('button').first().click()

    await expect(dialogOf(page)).toBeVisible()
    await expect(page).toHaveURL(/showBooking=/)
  })

  test('offers the three accounts and the number the settings hold', async ({ page }) => {
    await page.goto(`${pathFor('/empty_legs', 'en')}?showBooking=Header`)
    const dialog = dialogOf(page)

    await expect(dialog.getByRole('link', { name: 'Telegram' })).toHaveAttribute(
      'href',
      'https://t.me/melentev1',
    )
    await expect(dialog.getByRole('link', { name: 'WhatsApp' })).toBeVisible()
    await expect(dialog.getByRole('link', { name: 'Instagram' })).toBeVisible()
    // The legacy printed one number and dialled another (section 13, entry 73).
    await expect(dialog.getByRole('link', { name: '+971 (50) 458-99-26' })).toHaveAttribute(
      'href',
      'tel:+971504589926',
    )
  })

  for (const [how, close] of [
    [
      'the close button',
      (page: Page) => dialogOf(page).getByRole('button', { name: 'Close' }).click(),
    ],
    ['Escape', (page: Page) => page.keyboard.press('Escape')],
    ['a click outside it', (page: Page) => dialogOf(page).click({ position: { x: 5, y: 5 } })],
  ] as const) {
    test(`closes on ${how}, and takes every parameter with it`, async ({ page }) => {
      // The legacy pushed the pathname alone, so `direction` and the campaign went too
      // (section 13, entry 72, `keep`).
      await page.goto(`${pathFor('/empty_legs', 'en')}?showBooking=Header&utm_source=telegram`)
      await expect(dialogOf(page)).toBeVisible()

      await close(page)

      await expect(dialogOf(page)).toHaveCount(0)
      await expect(page).toHaveURL(pathFor('/empty_legs', 'en'))
    })
  }

  test('hands the focus to the dialog and gives it back to the page', async ({ page }) => {
    // The legacy left the focus on the page behind it, so a keyboard went on reading the page.
    await page.goto(pathFor('/empty_legs', 'en'))
    const opener = page.locator('[data-section="footer"]').getByRole('button').first()
    await opener.click()

    await expect(dialogOf(page)).toBeVisible()
    await expect(dialogOf(page).locator('[tabindex="-1"]').first()).toBeFocused()

    await page.keyboard.press('Escape')
    await expect(opener).toBeFocused()
  })

  test('says it in the language of the page', async ({ page }) => {
    await page.goto(`${pathFor('/empty_legs', 'ru')}?showBooking=Header`)

    await expect(dialogOf(page)).toHaveAttribute('aria-label', 'Забронировать')
    await expect(dialogOf(page).getByRole('button', { name: 'Отправить' })).toBeVisible()
  })
})

test.describe('a lead left in the dialog', () => {
  test.describe.configure({ mode: 'serial' })

  const name = visitor()

  test('carries the legs the flight request handed over', async ({ page }) => {
    const legs = JSON.stringify([{ from: 'Dubai (OMDB)', date: '2026-10-01', passengers: 3 }])
    await page.goto(
      `${pathFor('/empty_legs', 'en')}?showBooking=Flight_request&direction=${encodeURIComponent(legs)}`,
    )
    const dialog = dialogOf(page)

    await dialog.getByLabel('Name').fill(name)
    await dialog.getByLabel('Email').fill('caller@example.test')
    await dialog.getByLabel('Phone number').fill('+971504589926')
    await asAVisitor(page)
    await dialog.getByRole('button', { name: 'Send' }).click()

    await expect(dialog.getByRole('status')).toHaveText('Successfully sent')
  })

  test('is traced back to the button that opened it', async ({ admin, page }) => {
    await admin.login(testUser)
    await admin.gotoCollection('leads')

    const row = page.locator('tr', { hasText: name }).first()
    await expect(row).toBeVisible()
    await expect(row).toContainText('Flight_request')
  })
})
