import { expect, test } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The advantages as a block (issue #128, `docs/legacy-inventory.md` section 5): a wide
 * photograph with the columns under it. The legacy section was a client component because it
 * animated; here only the reveal is, and the words are on the page before it runs.
 */
const SECTION = '[data-section="advantages"]'

test.describe('the advantages section', () => {
  test('is in the HTML the server sends, every column of it', async ({ request }) => {
    const html = await (await request.get(pathFor('/sales_dept', 'en'))).text()

    expect(html).toContain('data-section="advantages"')
    expect(html).toContain('Each aircraft is assessed by a team of mechanics')
    expect(html).toContain('ABC check verification')
  })

  test('draws one column per advantage the block carries', async ({ page }) => {
    await page.goto(pathFor('/sales_dept', 'en'))

    await expect(page.locator(`${SECTION} [data-cards="advantage"] > div`)).toHaveCount(3)
  })

  test('speaks the language of the page it is on', async ({ request }) => {
    const html = await (await request.get(pathFor('/sales_dept', 'ru'))).text()

    expect(html).toContain('Проверка АВС')
    expect(html).not.toContain('ABC check verification')
  })
})
