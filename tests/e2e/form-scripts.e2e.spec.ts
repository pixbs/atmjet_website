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
})
