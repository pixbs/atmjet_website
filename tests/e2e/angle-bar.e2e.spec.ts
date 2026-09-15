import { expect, test, type Page } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The floating button the home page carries (issue #94, `docs/legacy-inventory.md` section 3.5):
 * where it is, what it opens, and where each of its links goes.
 */
const SECTION = '[data-section="angle-bar"]'

const barOf = (page: Page) => page.locator(SECTION)
const toggleOf = (page: Page) => barOf(page).getByRole('button', { name: /menu|меню/i })

test.describe('the floating button', () => {
  test('is on the home page and nowhere else', async ({ page }) => {
    await page.goto(pathFor('/', 'en'))
    await expect(barOf(page)).toBeVisible()

    await page.goto(pathFor('/yachts', 'en'))
    await expect(barOf(page)).toHaveCount(0)
  })

  test('opens the menu and closes it again, saying which it is doing', async ({ page }) => {
    await page.goto(pathFor('/', 'en'))
    const toggle = toggleOf(page)

    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await toggle.click()

    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(barOf(page).getByRole('link', { name: 'Telegram' })).toBeVisible()

    await toggle.click()
    await expect(barOf(page).getByRole('link', { name: 'Telegram' })).toHaveCount(0)
  })

  test('reaches ATM JET where the site settings say it does', async ({ page }) => {
    await page.goto(pathFor('/', 'en'))
    await toggleOf(page).click()
    const bar = barOf(page)

    await expect(bar.getByRole('link', { name: 'Telegram' })).toHaveAttribute(
      'href',
      'https://t.me/melentev1',
    )
    await expect(bar.getByRole('link', { name: 'WhatsApp' })).toHaveAttribute(
      'href',
      'https://wa.me/971504589926',
    )
    // The value the legacy link carried, which is how a lead from this button is traced back.
    await expect(bar.getByRole('link', { name: /Make a booking/ })).toHaveAttribute(
      'href',
      '?showBooking=Angle_bar',
    )
  })

  test('draws the page link only where the language has wording for it', async ({ page }) => {
    // The legacy drew it for Russian readers by comparing the locale in the component; here the
    // English catalogue simply has no wording for it (ADR-0003).
    await page.goto(pathFor('/', 'ru'))
    await toggleOf(page).click()
    await expect(barOf(page).getByRole('link', { name: 'Для граждан РФ' })).toHaveAttribute(
      'href',
      '/ru/citizens',
    )

    await page.goto(pathFor('/', 'en'))
    await toggleOf(page).click()
    await expect(barOf(page).getByRole('link', { name: /citizens/i })).toHaveCount(0)
  })
})
