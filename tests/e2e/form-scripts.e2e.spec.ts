import type { Page } from '@playwright/test'

import { expect, test } from './fixtures'
import { pathFor } from './routes'

/**
 * The booking forms load their heaviest code only once a visitor uses them (issue #428): the
 * phone library and its flags, and zod, were on the first load of every page, in the way of the
 * largest paint.
 *
 * A chunk's name is a hash, so a library is known by a string only it ships: the metadata key of
 * libphonenumber and the error code of zod.
 */
const LIBRARIES = { phone: 'country_calling_codes', zod: 'invalid_type' } as const

type Library = keyof typeof LIBRARIES

/** Which of the libraries the scripts this page has downloaded so far contain. */
function watchScripts(page: Page) {
  const seen = new Set<Library>()

  page.on('response', async (response) => {
    if (response.request().resourceType() !== 'script') return
    const body = await response.text().catch(() => '')

    for (const [library, marker] of Object.entries(LIBRARIES)) {
      if (body.includes(marker)) seen.add(library as Library)
    }
  })

  return seen
}

/** Fails every script carrying `marker`, as a dropped connection would, until it is released. */
async function failScripts(page: Page, marker: string) {
  const failed = { count: 0, isFailing: true }

  await page.route('**/_next/static/chunks/*.js', async (route) => {
    const response = await route.fetch()

    if (!failed.isFailing || !(await response.text()).includes(marker)) {
      return route.fulfill({ response })
    }
    failed.count += 1
    return route.abort()
  })

  return {
    /** How many times the script was asked for and refused. */
    failures: () => failed.count,
    release: () => {
      failed.isFailing = false
    },
  }
}

/** Where the contact section's form is, on a page that ends with it. */
const contactForm = (page: Page) =>
  page.locator('[data-section="contact-us"] [data-section="booking-form"]')

test.describe('the booking forms', () => {
  for (const path of ['/', '/aircraft', '/aircraft/MOUSE', '/yachts']) {
    test(`leave the phone library and zod off the first load of ${path}`, async ({ page }) => {
      const seen = watchScripts(page)

      await page.goto(pathFor(path, 'en'))
      await page.waitForLoadState('networkidle')

      expect([...seen]).toEqual([])
    })
  }

  test('fetch them as soon as the contact form is used', async ({ page }) => {
    const seen = watchScripts(page)
    await page.goto(pathFor('/yachts', 'en'))
    const form = page.locator('[data-section="contact-us"] [data-section="booking-form"]')

    await form.getByRole('textbox', { name: 'Phone number' }).fill('971504589926')
    await form.getByRole('textbox', { name: 'Name' }).focus()

    // Formatted, and judged when it is left, as it was before the code was split off.
    await expect(form.getByRole('textbox', { name: 'Phone number' })).toHaveValue(
      '+971 50 458 9926',
    )
    await form.getByRole('textbox', { name: 'Email' }).focus()
    await expect(form.getByText('Required')).toBeVisible()
    await expect.poll(() => [...seen].sort()).toEqual(['phone', 'zod'])
  })

  test.describe('when their code cannot be fetched', () => {
    test('leave the page as it was, and open the dialog on the next try', async ({ page }) => {
      await page.goto(pathFor('/empty_legs', 'en'))
      await page.waitForLoadState('networkidle')
      const panel = await failScripts(page, '"data-section":"booking-dialog"')

      await page.locator('a[href="?showBooking=Footer"]').click()
      // Turbopack asks for a chunk that failed once more before it gives up on it.
      await expect.poll(panel.failures).toBe(2)

      await expect(page.locator('main [data-section]').first()).toBeVisible()
      await expect(page.getByRole('dialog')).toHaveCount(0)

      panel.release()
      await page.locator('a[href="?showBooking=Footer"]').click()

      await expect(page.getByRole('dialog').locator('[data-section="booking-form"]')).toBeVisible()
    })

    test('open the dialog from any booking button once a lost connection is back', async ({
      page,
      context,
    }) => {
      // The home page's links need nothing from the server to change the query, as on master.
      await page.goto(pathFor('/', 'en'))
      await page.waitForLoadState('networkidle')

      let failures = 0
      page.on('requestfailed', (request) => {
        if (request.url().includes('/_next/static/chunks/')) failures += 1
      })

      await context.setOffline(true)
      await page.locator('a[href="?showBooking=Footer"]').click()
      // Turbopack asks for a chunk that failed once more before it gives up on it.
      await expect.poll(() => failures).toBe(2)

      await expect(page).toHaveURL(/showBooking=Footer/)
      await expect(page.locator('main [data-section]').first()).toBeVisible()
      await expect(page.getByRole('dialog')).toHaveCount(0)

      await context.setOffline(false)
      await page.locator('a[href="?showBooking=Empty-legs"]').first().click()

      await expect(page.getByRole('dialog').locator('[data-section="booking-form"]')).toBeVisible()
    })

    test('say a send did not go without the rules, and send on the next try', async ({ page }) => {
      await page.goto(pathFor('/yachts', 'en'))
      await page.waitForLoadState('networkidle')
      const zod = await failScripts(page, LIBRARIES.zod)
      const form = contactForm(page)

      await form.getByRole('textbox', { name: 'Name' }).fill(`A caller ${Date.now().toString(36)}`)
      await form.getByRole('textbox', { name: 'Phone number' }).fill('971504589926')
      await form.getByRole('textbox', { name: 'Email' }).fill('caller@example.com')
      // The action refuses a form sent faster than a person fills one in (issue #157).
      await page.waitForTimeout(2_500)
      await form.getByRole('button', { name: 'Send' }).click()

      await expect(form.getByRole('alert')).toHaveText('Something went wrong. Please try again.')

      zod.release()
      await form.getByRole('button', { name: 'Try again' }).click()

      await expect(page.locator('[data-section="contact-us"] [data-state="sent"]')).toBeVisible()
    })

    test('keep the phone field shut and asking, and format on the next try', async ({ page }) => {
      await page.goto(pathFor('/yachts', 'en'))
      await page.waitForLoadState('networkidle')
      const phone = await failScripts(page, LIBRARIES.phone)
      const form = contactForm(page)
      const field = form.getByRole('textbox', { name: 'Phone number' })
      const country = form.getByRole('button', { name: 'United Arab Emirates' })

      await field.fill('971504589926')
      await country.click()

      await expect(country).toHaveAttribute('aria-expanded', 'false')
      await expect(form.getByRole('listbox')).toHaveCount(0)

      phone.release()
      await form.getByRole('textbox', { name: 'Name' }).focus()
      await field.focus()

      await expect(field).toHaveValue('+971 50 458 9926')
    })
  })
})
