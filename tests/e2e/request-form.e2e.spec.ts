import { expect, test, type Page } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The flight request (issues #151 and #107, `docs/legacy-inventory.md` section 7.1): the legs a
 * visitor adds, the round trip, the airport the field offers, and the query the whole thing
 * becomes for the booking dialog.
 */
const FORM = '[data-section="request-form"]'

const formOf = (page: Page) => page.locator(FORM)
const legsOf = (page: Page) => page.locator(`${FORM} [id$="-from"]`)

/** Fills the first leg in, as a visitor would, without touching the airport list. */
async function fillFirstLeg(page: Page, date = '2026-10-01') {
  await formOf(page).getByRole('combobox', { name: 'From' }).first().fill('Dubai (OMDB)')
  await page.locator('#leg-0-date').fill(date)
}

test.describe('the flight request', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(pathFor('/styleguide', 'en'))
    await formOf(page).scrollIntoViewIfNeeded()
  })

  test('adds legs up to the four the legacy offered, and stops offering more', async ({ page }) => {
    const form = formOf(page)
    await expect(legsOf(page)).toHaveCount(1)

    for (let leg = 1; leg < 4; leg++) await form.getByRole('button', { name: 'Add leg' }).click()

    await expect(legsOf(page)).toHaveCount(4)
    await expect(form.getByRole('button', { name: 'Add leg' })).toHaveCount(0)
  })

  test('takes a leg away again, leaving the first where it was', async ({ page }) => {
    const form = formOf(page)
    await form.getByRole('button', { name: 'Add leg' }).click()
    await form.getByRole('combobox', { name: 'From' }).first().fill('Dubai')

    await form.getByRole('button', { name: 'Delete leg' }).click()

    await expect(legsOf(page)).toHaveCount(1)
    await expect(form.getByRole('combobox', { name: 'From' })).toHaveValue('Dubai')
  })

  test('asks when the flight comes back once it is a round trip', async ({ page }) => {
    const form = formOf(page)
    await expect(form.getByText('Date')).toBeVisible()

    await form.getByRole('button', { name: 'Round trip' }).click()

    // The legacy renamed the first date and added the second (section 7.1).
    await expect(form.getByText('When')).toBeVisible()
    await expect(form.getByText('Return')).toBeVisible()
    await expect(form.getByRole('button', { name: 'Add leg' })).toHaveCount(0)
  })

  test('throws away the legs a round trip replaces, and does not hand them back', async ({
    page,
  }) => {
    // `remove([1..n])` with no counterpart, which section 13 entry 65 marks `keep` rather than a
    // bug to fix: a visitor who looks at the return flight loses the itinerary they had typed.
    const form = formOf(page)
    await form.getByRole('button', { name: 'Add leg' }).click()
    await form.getByRole('combobox', { name: 'From' }).nth(1).fill('London')

    await form.getByRole('button', { name: 'Round trip' }).click()
    await expect(legsOf(page)).toHaveCount(1)

    await form.getByRole('button', { name: 'Multi-leg' }).click()
    await expect(legsOf(page)).toHaveCount(1)
  })

  test('offers the airports the search ranks, and puts the one chosen into the leg', async ({
    page,
  }) => {
    const from = formOf(page).getByRole('combobox', { name: 'From' }).first()
    await from.fill('dub')

    const options = formOf(page).getByRole('listbox').getByRole('option')
    await expect(options.first()).toHaveText(
      'Dubai (OMDB) United Arab Emirates, Dubai International',
    )

    await options.first().click()
    await expect(from).toHaveValue('Dubai (OMDB) United Arab Emirates, Dubai International')
  })

  test('hands the legs to the booking dialog in the query', async ({ page }) => {
    await fillFirstLeg(page)
    await formOf(page).getByRole('button', { name: 'Request Quote' }).first().click()

    await expect(page).toHaveURL(/\?showBooking=Flight_request&direction=/)
    const direction = new URL(page.url()).searchParams.get('direction')
    expect(JSON.parse(direction ?? '[]')).toEqual([
      { from: 'Dubai (OMDB)', date: '2026-10-01', passengers: 1 },
    ])
  })

  test('refuses an unfinished request in silence, as the legacy refused it', async ({ page }) => {
    // The legacy form rendered no errors at all, so nothing happened and nothing was said
    // (section 13, entry 64); giving it a voice is a decision of its own.
    await formOf(page).getByRole('button', { name: 'Request Quote' }).first().click()

    await expect(page).not.toHaveURL(/showBooking/)
    await expect(formOf(page).getByRole('alert')).toHaveCount(0)
  })
})
