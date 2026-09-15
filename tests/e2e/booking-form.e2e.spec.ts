import type { Page } from '@playwright/test'

import { testUser } from '../helpers/seedUser'
import { expect, test } from './fixtures'
import { pathFor } from './routes'

/**
 * The form that turns a visitor into a lead (issues #152 and #154,
 * `docs/legacy-inventory.md` section 7.2): what it says while it is being filled in, and what it
 * leaves behind once it is sent — which on the legacy site was nothing at all (section 9.1).
 */
/**
 * The styleguide's own copy, not the one the booking dialog carries: a page opened with
 * `?showBooking=` now has both (issue #93).
 */
const FORM = '[data-section="booking-form-example"] [data-section="booking-form"]'

/** Unique, so a run can find its own lead in a list every run adds to. */
const visitor = () => `A visitor ${Date.now().toString(36)}`

/**
 * A browser fills three fields in faster than any person, and the action refuses a submission
 * sent inside the first couple of seconds (issue #157). A test that means to be taken for a
 * visitor spends a visitor's time over it.
 */
const asAVisitor = (page: Page) => page.waitForTimeout(2_500)

test.describe('the booking form', () => {
  test('says what is wrong with a field once it is left, and not before', async ({ page }) => {
    await page.goto(pathFor('/styleguide', 'en'))
    const form = page.locator(FORM)
    const email = form.getByLabel('Email')

    // The legacy timing: `mode: 'onBlur'` and `touchedFields && errors` (section 7.2).
    await email.fill('not an address')
    await expect(form.getByText('Invalid email')).toHaveCount(0)

    await email.blur()
    await expect(form.getByText('Invalid email')).toBeVisible()
  })

  test('sends nothing until every field is one the legacy would have taken', async ({ page }) => {
    await page.goto(pathFor('/styleguide', 'en'))
    const form = page.locator(FORM)

    await form.getByLabel('Name').fill('A visitor')
    await form.getByLabel('Email').fill('visitor@example.test')
    await form.getByLabel('Phone number').fill('+971 50')
    await form.getByLabel('Phone number').blur()
    await expect(form.getByText('Invalid phone number')).toBeVisible()

    await form.getByRole('button', { name: 'Send' }).click()

    await expect(form.getByRole('status')).toHaveCount(0)
  })
})

test.describe('a lead', () => {
  test.describe.configure({ mode: 'serial' })

  const name = visitor()

  test('is written down when the form is sent', async ({ page }) => {
    // Without `?showBooking=`, which now opens the dialog over the page (issue #93); the query
    // a lead is traced back through is that dialog's story, in `booking-dialog.e2e.spec.ts`.
    await page.goto(pathFor('/styleguide', 'en'))
    const form = page.locator(FORM)

    await form.getByLabel('Name').fill(name)
    await form.getByLabel('Email').fill('visitor@example.test')
    await form.getByLabel('Phone number').fill('+971504589926')
    // The chip is a checkbox with its box taken away, so it is the label that is clicked.
    await form.getByText('Partnership request').click()
    await asAVisitor(page)
    await form.getByRole('button', { name: 'Send' }).click()

    await expect(form.getByRole('status')).toHaveText('Successfully sent')
    // The legacy inline form kept what had been typed after a send; this one is ready for the
    // next visitor.
    await expect(form.getByLabel('Name')).toHaveValue('')
  })

  test('appears in the admin, with how it was delivered', async ({ admin, page }) => {
    await admin.login(testUser)
    await admin.gotoCollection('leads')

    const row = page.locator('tr', { hasText: name }).first()
    await expect(row).toBeVisible()
    // The columns the desk looks at first (issue #154).
    await expect(row).toContainText('+971 50 458 9926')
    await expect(row).toContainText('pending')
  })
})

/**
 * The invisible measures of issue #157, from the browser's side: the honeypot is out of the way
 * of anybody filling the form in, and a submission that fills it in is refused without a word.
 */
test.describe('a submission that looks automated', () => {
  test('leaves the honeypot out of the way of anyone filling the form in', async ({ page }) => {
    await page.goto(pathFor('/styleguide', 'en'))
    const form = page.locator(FORM)
    const trap = form.locator('input[name="company"]')

    await expect(trap).toHaveCount(1)
    // Out of the page for a person: no box, and nothing a tab can land on.
    await expect(trap).not.toBeInViewport()
    await expect(trap).toHaveAttribute('tabindex', '-1')
  })

  test('is refused, with nothing said, when the honeypot has been filled in', async ({ page }) => {
    await page.goto(pathFor('/styleguide', 'en'))
    const form = page.locator(FORM)

    await form.getByLabel('Name').fill(visitor())
    await form.getByLabel('Email').fill('script@example.test')
    await form.getByLabel('Phone number').fill('+971504589926')
    await form
      .locator('input[name="company"]')
      .evaluate((field: HTMLInputElement) => (field.value = 'ATM JET'))
    await asAVisitor(page)

    await form.getByRole('button', { name: 'Send' }).click()

    // Nothing is said either way: the confirm state is what a lead that was written gets.
    await expect(form.getByRole('status')).toHaveCount(0)
    await expect(form.getByLabel('Email')).toHaveValue('script@example.test')
  })

  test('is refused when the form is sent the instant it is reached', async ({ page }) => {
    await page.goto(pathFor('/styleguide', 'en'))
    const form = page.locator(FORM)

    await form.getByLabel('Name').fill(visitor())
    await form.getByLabel('Email').fill('hurried@example.test')
    await form.getByLabel('Phone number').fill('+971504589926')
    await form.getByRole('button', { name: 'Send' }).click()

    await expect(form.getByRole('status')).toHaveCount(0)
  })
})
