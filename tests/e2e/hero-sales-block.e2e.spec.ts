import { expect, test } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The sales hero as a block (issue #113, `docs/legacy-inventory.md` section 5): the words come
 * from the document and are in the markup the server sends; only the counting and the arrival
 * need a script.
 */
const SECTION = '[data-section="hero-sales"]'

test.describe('the sales hero', () => {
  test('is in the HTML the server sends, headline and button alike', async ({ request }) => {
    const html = await (await request.get(pathFor('/sales_dept', 'en'))).text()

    expect(html).toContain('data-section="hero-sales"')
    expect(html).toContain('Sales dept.')
    expect(html).toContain('Years')
    expect(html).toContain('Aircraft')
    expect(html).toContain('Contact us')
  })

  test('is the heading of the page it opens', async ({ page }) => {
    await page.goto(pathFor('/sales_dept', 'en'))

    // The figures reach their target whether or not the counting runs (reduced motion).
    await expect(page.locator(SECTION).getByRole('heading', { level: 1 })).toContainText('20+')
  })

  test('asks for the booking dialog without leaving the page', async ({ page }) => {
    await page.goto(pathFor('/sales_dept', 'en'))

    await expect(page.locator(SECTION).getByRole('link', { name: 'Contact us' })).toHaveAttribute(
      'href',
      '?showBooking=Hero_sales',
    )
  })

  test('keeps the sentence on the lines it was written on', async ({ page }) => {
    await page.goto(pathFor('/sales_dept', 'en'))
    const sentence = page.locator(SECTION).locator('p', { hasText: 'We offer access to over' })

    // The legacy split this sentence on its newlines and drew each line in turn.
    await expect(sentence).toHaveText(/aviation needs\.\s*With more than 20 years/)
  })

  test('speaks the language of the page it is on', async ({ request }) => {
    const html = await (await request.get(pathFor('/sales_dept', 'ru'))).text()

    expect(html).toContain('Продажи самолетов')
    expect(html).not.toContain('Sales dept.')
  })
})
