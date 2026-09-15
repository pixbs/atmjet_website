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
 * A browser fills three fields in faster than any person. Issue #157 puts a floor under that in
 * the server action, so the wait is here already and this spec needs no change when it lands.
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

    // The confirm view the legacy wrote and nobody could reach (section 13, entry 59): it is
    // what the form becomes, so there is nothing left to type into.
    await expect(form.getByRole('status')).toHaveText('Successfully sent')
    await expect(form).toHaveAttribute('data-state', 'sent')
    await expect(form.getByLabel('Name')).toHaveCount(0)
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
 * What a form says when the enquiry does not get away (issue #158). The legacy said nothing
 * and closed the dialog anyway, so a lead that never arrived looked exactly like one that did
 * (`docs/legacy-inventory.md` section 13, entry 59).
 */
test.describe('a submission that does not get through', () => {
  /** The action posts back to the page it is on; nothing else on these specs does. */
  const refuseTheAction = (page: Page) =>
    page.route('**/en/styleguide**', (route) =>
      route.request().method() === 'POST' ? route.abort('failed') : route.continue(),
    )

  test('says so, and keeps what was typed so it can be sent again', async ({ page }) => {
    await refuseTheAction(page)
    await page.goto(pathFor('/styleguide', 'en'))
    const form = page.locator(FORM)
    const name = visitor()

    await form.getByLabel('Name').fill(name)
    await form.getByLabel('Email').fill('unlucky@example.test')
    await form.getByLabel('Phone number').fill('+971504589926')
    await asAVisitor(page)
    await form.getByRole('button', { name: 'Send' }).click()

    await expect(form.getByRole('alert')).toHaveText('Something went wrong. Please try again.')
    // Not the confirm view: the enquiry is not away, and the form does not pretend it is.
    await expect(form.getByRole('status')).toHaveCount(0)
    await expect(form.getByLabel('Name')).toHaveValue(name)
    await expect(form.getByRole('button', { name: 'Try again' })).toBeVisible()
  })

  test('sends it once the second press gets through', async ({ page }) => {
    await refuseTheAction(page)
    await page.goto(pathFor('/styleguide', 'en'))
    const form = page.locator(FORM)

    await form.getByLabel('Name').fill(visitor())
    await form.getByLabel('Email').fill('second-try@example.test')
    await form.getByLabel('Phone number').fill('+971504589926')
    await asAVisitor(page)
    await form.getByRole('button', { name: 'Send' }).click()
    await expect(form.getByRole('button', { name: 'Try again' })).toBeVisible()

    await page.unroute('**/en/styleguide**')
    await asAVisitor(page)
    await form.getByRole('button', { name: 'Try again' }).click()

    await expect(form.getByRole('status')).toHaveText('Successfully sent')
  })
})

/**
 * The invisible measures of issue #157, from the browser's side: the honeypot is out of the way
 * of anybody filling the form in, and a submission that fills it in never becomes a lead.
 */
test.describe('a submission that looks automated', () => {
  test('leaves the honeypot out of the way of anyone filling the form in', async ({ page }) => {
    await page.goto(pathFor('/styleguide', 'en'))
    const form = page.locator(FORM)
    // By what it is rather than by what it is called: the name is chosen so that no browser
    // recognises it, and naming it here would pin the one thing that has to stay free to change.
    const trap = form.locator('input[aria-hidden="true"]')

    await expect(trap).toHaveCount(1)
    // Out of the page for a person: no box, and nothing a tab can land on.
    await expect(trap).not.toBeInViewport()
    await expect(trap).toHaveAttribute('tabindex', '-1')
  })

  test('is refused when the honeypot has been filled in', async ({ page }) => {
    await page.goto(pathFor('/styleguide', 'en'))
    const form = page.locator(FORM)

    await form.getByLabel('Name').fill(visitor())
    await form.getByLabel('Email').fill('script@example.test')
    await form.getByLabel('Phone number').fill('+971504589926')
    await form
      .locator('input[aria-hidden="true"]')
      .evaluate((field: HTMLInputElement) => (field.value = 'ATM JET'))
    await asAVisitor(page)

    await form.getByRole('button', { name: 'Send' }).click()

    // No confirm view: nothing was written down. What it does say is what a failed send says
    // (issue #158), which tells a script nothing it did not already know.
    await expect(form.getByRole('status')).toHaveCount(0)
    await expect(form.getByRole('alert')).toBeVisible()
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
