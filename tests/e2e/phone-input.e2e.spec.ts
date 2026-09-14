import { expect, test, type Page } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The phone field of the booking form (issue #108, `docs/legacy-inventory.md` section 7.2):
 * what it does to a number as it is typed, and how the country is changed by hand.
 */
const SECTION = '[data-section="phone"]'

const fieldOf = (page: Page) => page.locator(SECTION).getByRole('textbox', { name: 'Phone' })
const triggerOf = (page: Page) => page.locator(SECTION).getByRole('button')
const listOf = (page: Page) => page.locator(SECTION).getByRole('listbox')
const rowsOf = (page: Page) => page.locator(SECTION).getByRole('option')

test.describe('the phone field', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(pathFor('/styleguide', 'en'))
    await fieldOf(page).scrollIntoViewIfNeeded()
  })

  test('opens on the country the language falls back to', async ({ page }) => {
    // The legacy opened on Åland Islands, whose dial code its own matcher could not read.
    await expect(triggerOf(page)).toHaveAccessibleName('United Arab Emirates')
  })

  test('groups the number as it is typed, under its own plus', async ({ page }) => {
    const field = fieldOf(page)

    await field.fill('971504589926')

    await expect(field).toHaveValue('+971 50 458 9926')
  })

  test('follows the country the dial code belongs to', async ({ page }) => {
    const field = fieldOf(page)

    await field.fill('380441234567')

    await expect(triggerOf(page)).toHaveAccessibleName('Ukraine')
  })

  test('reads the whole dial code, not the first three digits', async ({ page }) => {
    // `+1268` is Antigua; the legacy matcher stopped at `+126` and settled on the first `+1`.
    await fieldOf(page).fill('12684641234')

    await expect(triggerOf(page)).toHaveAccessibleName('Antigua & Barbuda')
  })

  test('starts the number again when a country is chosen by hand', async ({ page }) => {
    await triggerOf(page).click()
    await expect(listOf(page)).toBeVisible()

    await page.locator(SECTION).getByRole('searchbox').fill('Ukraine')
    await rowsOf(page).first().click()

    await expect(fieldOf(page)).toHaveValue('+380 ')
    await expect(listOf(page)).toHaveCount(0)
  })

  test('can be searched by dial code', async ({ page }) => {
    await triggerOf(page).click()
    const search = page.locator(SECTION).getByRole('searchbox')

    await search.fill('971')
    await expect(rowsOf(page)).toHaveCount(1)
    await search.press('Enter')

    await expect(fieldOf(page)).toHaveValue('+971 ')
  })

  test('walks the list with the arrow keys', async ({ page }) => {
    await triggerOf(page).click()
    const search = page.locator(SECTION).getByRole('searchbox')

    // Afghanistan, Åland Islands, then Albania: two down from where the list opens.
    await search.press('ArrowDown')
    await search.press('ArrowDown')
    await expect(rowsOf(page).nth(2)).toHaveAttribute('aria-selected', 'true')

    await search.press('Enter')

    await expect(fieldOf(page)).toHaveValue('+355 ')
  })

  test('says the number is wrong once it has been left, and stops when it is right', async ({
    page,
  }) => {
    const field = fieldOf(page)

    // The legacy form showed the error on a touched field only, never while it was being typed.
    await field.fill('+971 50')
    await expect(field).not.toHaveAttribute('aria-invalid', 'true')

    await field.blur()
    await expect(field).toHaveAttribute('aria-invalid', 'true')

    await field.fill('+971 50 458 9926')
    await expect(field).not.toHaveAttribute('aria-invalid', 'true')
  })

  test('says so when nothing matches', async ({ page }) => {
    await triggerOf(page).click()
    await page.locator(SECTION).getByRole('searchbox').fill('atlantis')

    await expect(page.locator(SECTION).getByText('No results')).toBeVisible()
  })

  test('shuts the list on a press outside it', async ({ page }) => {
    await triggerOf(page).click()
    await expect(listOf(page)).toBeVisible()

    await page.locator(SECTION).getByRole('heading', { name: 'Phone' }).click()

    await expect(listOf(page)).toHaveCount(0)
  })
})
