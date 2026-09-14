import { expect, test } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The FAQ accordion (issue #106). The legacy title was a paragraph with an `onClick`
 * (`docs/legacy-inventory.md` section 6), so a visitor using a keyboard could not open a
 * question at all; these are the two ways in and the one-open-at-a-time rule.
 */
test.describe('accordion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(pathFor('/styleguide', 'en'))
  })

  test('opens and closes a question with the pointer', async ({ page }) => {
    const second = page.getByRole('button', { name: 'The second question' })

    await expect(second).toHaveAttribute('aria-expanded', 'false')

    await second.click()
    await expect(second).toHaveAttribute('aria-expanded', 'true')

    await second.click()
    await expect(second).toHaveAttribute('aria-expanded', 'false')
  })

  test('opens a question from the keyboard', async ({ page }) => {
    const second = page.getByRole('button', { name: 'The second question' })

    await second.focus()
    await page.keyboard.press('Enter')

    await expect(second).toHaveAttribute('aria-expanded', 'true')
  })

  test('shows one answer at a time, as the legacy FAQ did', async ({ page }) => {
    const first = page.getByRole('button', { name: 'The first question' })
    const second = page.getByRole('button', { name: 'The second question' })

    // The first question arrives open, which is how the legacy FAQ rendered.
    await expect(first).toHaveAttribute('aria-expanded', 'true')

    await second.click()

    await expect(first).toHaveAttribute('aria-expanded', 'false')
    await expect(second).toHaveAttribute('aria-expanded', 'true')
  })

  test('names the answer it controls, so a screen reader can follow', async ({ page }) => {
    const first = page.getByRole('button', { name: 'The first question' })
    const answerId = await first.getAttribute('aria-controls')

    await expect(page.locator(`#${answerId}`)).toBeVisible()
  })
})
