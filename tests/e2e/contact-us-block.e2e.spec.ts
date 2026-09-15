import { cleanupTestUser, seedTestUser, testUser } from '../helpers/seedUser'
import { expect, test } from './fixtures'
import { pathFor } from './routes'

/**
 * The contact section every legacy page ended with (issue #129, `docs/legacy-inventory.md`
 * section 5): the two messenger cards, the booking form, and the card with the address and the
 * telephone number on it.
 */
const SECTION = '[data-section="contact-us"]'

/** Unique, so a run can find its own lead in a list every run adds to. */
const visitor = () => `A caller ${Date.now().toString(36)}`

test.describe('the contact section', () => {
  test('is in the HTML the server sends, with the form in it', async ({ request }) => {
    const html = await (await request.get(pathFor('/cargo_charter', 'en'))).text()

    expect(html).toContain('data-section="contact-us"')
    expect(html).toContain(
      'Manage your enquiries and bookings on go via private chat with our team',
    )
    expect(html).toContain('data-section="booking-form"')
  })

  test('reaches the accounts the settings name, not ones typed into the page', async ({ page }) => {
    await page.goto(pathFor('/cargo_charter', 'en'))
    const section = page.locator(SECTION)

    await expect(section.getByRole('link', { name: 'Telegram' })).toHaveAttribute(
      'href',
      'https://t.me/melentev1',
    )
    await expect(section.getByRole('link', { name: 'Whatsapp' })).toHaveAttribute(
      'href',
      'https://wa.me/971504589926',
    )
    await expect(section.getByRole('link', { name: 'info@atmjet.com' })).toHaveAttribute(
      'href',
      'mailto:info@atmjet.com',
    )
  })

  test('dials the number it prints, which the legacy did not', async ({ page }) => {
    // The legacy `tel:` reached +971 58 594 0112 while the card read +971 50 458 99 26
    // (section 13, entry 73); both are the one number an editor writes now.
    await page.goto(pathFor('/cargo_charter', 'en'))
    const number = page.locator(SECTION).getByRole('link', { name: '+971 (50) 458-99-26' })

    await expect(number).toHaveAttribute('href', 'tel:+971504589926')
  })

  test('says it in the language of the page', async ({ request }) => {
    const html = await (await request.get(pathFor('/cargo_charter', 'ru'))).text()

    expect(html).toContain('Телефонная линия открыта 24/7')
    expect(html).not.toContain('Telephone line is open 24/7')
  })
})

test.describe('a lead left on a page', () => {
  test.describe.configure({ mode: 'serial' })

  const name = visitor()

  test.beforeAll(() => {
    seedTestUser()
  })

  test.afterAll(() => {
    cleanupTestUser()
  })

  test('is sent from the section itself, with no dialog to open it', async ({ page }) => {
    await page.goto(pathFor('/cargo_charter', 'en'))
    const form = page.locator(SECTION).locator('[data-section="booking-form"]')
    await form.scrollIntoViewIfNeeded()

    await form.getByLabel('Name').fill(name)
    await form.getByLabel('Email').fill('caller@example.test')
    await form.getByLabel('Phone number').fill('+971504589926')
    await form.getByRole('button', { name: 'Send' }).click()

    await expect(form.getByRole('status')).toHaveText('Successfully sent')
  })

  test('is traced back to the section rather than to nothing', async ({ admin, page }) => {
    // The legacy inline form sent an empty `bookingType`, so a lead from a page named no
    // origin at all (section 13, entry 60).
    await admin.login(testUser)
    await admin.gotoCollection('leads')

    const row = page.locator('tr', { hasText: name }).first()
    await expect(row).toBeVisible()
    await expect(row).toContainText('Contact_us')
  })
})
