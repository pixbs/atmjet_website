import { expect, test } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The form primitives (issue #96, `docs/legacy-inventory.md` section 6). They carry no state and
 * no script — a text field, a select and a real checkbox — so what is worth asserting is what a
 * visitor can do with them, and in particular the one thing the legacy ones could not do.
 */
const STYLEGUIDE = pathFor('/styleguide', 'en')

test.describe('the form fields', () => {
  test('are in the HTML the server sends', async ({ request }) => {
    const html = await (await request.get(STYLEGUIDE)).text()

    expect(html).toContain('data-section="fields"')
    expect(html).toContain('<option value="passengers">Passengers</option>')
  })

  test('focus themselves when their label is clicked', async ({ page }) => {
    await page.goto(STYLEGUIDE)

    // The legacy label had no `htmlFor`, so clicking it did nothing at all.
    await page.getByText('From', { exact: true }).click()

    await expect(page.getByLabel('From')).toBeFocused()
  })

  test('take what is typed into them', async ({ page }) => {
    await page.goto(STYLEGUIDE)
    const from = page.getByLabel('From')

    await from.fill('Dubai')

    await expect(from).toHaveValue('Dubai')
  })

  test('let the sort order be chosen', async ({ page }) => {
    await page.goto(STYLEGUIDE)
    const sort = page.getByLabel('Sort by')

    await expect(sort).toHaveValue('size')
    await sort.selectOption('range')

    await expect(sort).toHaveValue('range')
  })

  test('show the tick once the box is checked, and hide it again', async ({ page }) => {
    await page.goto(STYLEGUIDE)
    const box = page.getByLabel('Unchecked')
    const tick = box.locator('..').locator('svg')

    await expect(tick).toBeHidden()

    await box.check()
    await expect(tick).toBeVisible()

    await box.uncheck()
    await expect(tick).toBeHidden()
  })
})
