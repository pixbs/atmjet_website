import { expect, test } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The quotations as a block (issue #132, `docs/legacy-inventory.md` section 4): two cards on
 * the citizens page, the press one and the founder's, told apart by the wordmark over them.
 *
 * The founder's words were written into the legacy page in Russian, whatever language the
 * visitor had asked for; they are content in both languages here.
 */
const SECTION = '[data-section="quote"]'

test.describe('the quote cards', () => {
  test('are in the HTML the server sends, both of them', async ({ request }) => {
    const html = await (await request.get(pathFor('/citizens', 'en'))).text()

    expect(html).toContain('data-quote="press"')
    expect(html).toContain('data-quote="founder"')
    expect(html).toContain('Artem Rumyantsev - founder of ATM JET')
  })

  test('stand each quotation under its own wordmark', async ({ page }) => {
    await page.goto(pathFor('/citizens', 'en'))

    await expect(page.locator(SECTION)).toHaveCount(2)
    // The wordmark is the whole of the difference between the two cards.
    await expect(page.locator('[data-quote="press"] svg')).toHaveCount(1)
    await expect(page.locator('[data-quote="founder"] svg')).toHaveCount(1)
  })

  test('speak the language of the page they are on', async ({ request }) => {
    const html = await (await request.get(pathFor('/citizens', 'ru'))).text()

    expect(html).toContain('Артем Румянцев - основатель ATM JET')
    expect(html).not.toContain('Artem Rumyantsev - founder of ATM JET')
  })
})
