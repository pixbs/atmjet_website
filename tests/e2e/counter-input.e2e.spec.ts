import { expect, test, type Page } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The passenger stepper (issue #97, `docs/legacy-inventory.md` section 6): the two buttons and
 * the field agree on one number, and it never leaves the range the legacy allowed.
 *
 * Scoped to the field section, because the flight request further down the page has a stepper
 * of its own on every leg (issue #151).
 */
const STYLEGUIDE = pathFor('/styleguide', 'en')

const fields = (page: Page) => page.locator('[data-section="fields"]')

test.describe('the passenger stepper', () => {
  test('starts at one passenger, with nothing to take away', async ({ page }) => {
    await page.goto(STYLEGUIDE)

    await expect(fields(page).getByLabel('Passengers', { exact: true })).toHaveValue('1')
    await expect(fields(page).getByRole('button', { name: 'Passengers −' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
  })

  test('counts up and down on the buttons', async ({ page }) => {
    await page.goto(STYLEGUIDE)
    const field = fields(page).getByLabel('Passengers', { exact: true })
    const more = fields(page).getByRole('button', { name: 'Passengers +' })

    await more.click()
    await more.click()
    await expect(field).toHaveValue('3')

    await fields(page).getByRole('button', { name: 'Passengers −' }).click()
    await expect(field).toHaveValue('2')
  })

  test('holds at one however often it is taken away from', async ({ page }) => {
    await page.goto(STYLEGUIDE)
    const field = fields(page).getByLabel('Passengers', { exact: true })
    const fewer = fields(page).getByRole('button', { name: 'Passengers −' })

    await expect(fewer).toHaveAttribute('aria-disabled', 'true')

    // Forced, because Playwright will not click a control that says it is disabled: the point
    // here is that the handler clamps even when the click lands, as the legacy one did.
    await fewer.click({ force: true })
    await fewer.click({ force: true })

    await expect(field).toHaveValue('1')
  })

  test('takes a typed number and clamps it to the range', async ({ page }) => {
    await page.goto(STYLEGUIDE)
    const field = fields(page).getByLabel('Passengers', { exact: true })

    await field.fill('99')
    await expect(field).toHaveValue('25')
    await expect(fields(page).getByRole('button', { name: 'Passengers +' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
  })

  test('keeps its number while a new one is being typed', async ({ page }) => {
    await page.goto(STYLEGUIDE)
    const field = fields(page).getByLabel('Passengers', { exact: true })

    await fields(page).getByRole('button', { name: 'Passengers +' }).click()
    await expect(field).toHaveValue('2')

    // Clearing the field to type another number leaves it empty for a keystroke.
    await field.fill('')

    await expect(field).toHaveValue('2')
  })
})
