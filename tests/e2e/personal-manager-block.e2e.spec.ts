import { expect, test } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The personal manager as a block (issue #124, `docs/legacy-inventory.md` section 5): the words
 * and the chips come from the document, and both pages the legacy introduced the manager on draw
 * the same block.
 */
const SECTION = '[data-section="personal-manager"]'

test.describe('the personal manager section', () => {
  test('is in the HTML the server sends, chips and all', async ({ request }) => {
    const html = await (await request.get(pathFor('/sales_dept', 'en'))).text()

    expect(html).toContain('data-section="personal-manager"')
    expect(html).toContain('A manager of your own')
    expect(html).toContain('One number')
    expect(html).toContain('Both languages')
  })

  test('draws one chip per row the block carries', async ({ page }) => {
    await page.goto(pathFor('/sales_dept', 'en'))

    await expect(page.locator(`${SECTION} [data-cards="chip"] > p`)).toHaveCount(5)
  })

  test('drops the stray text the legacy rendered beside the photograph', async ({ page }) => {
    await page.goto(pathFor('/sales_dept', 'en'))
    const section = page.locator(SECTION)

    await expect(section).toBeVisible()
    // The decision recorded on issue #124: no `aaa`, and no red placeholder behind the picture.
    await expect(section).not.toContainText('aaa')
  })

  test('is drawn on both pages the legacy introduced the manager on', async ({ request }) => {
    const partners = await (await request.get(pathFor('/partners', 'en'))).text()

    expect(partners).toContain('data-section="personal-manager"')
    expect(partners).toContain('A manager of your own')
  })

  test('speaks the language of the page it is on', async ({ request }) => {
    const html = await (await request.get(pathFor('/sales_dept', 'ru'))).text()

    expect(html).toContain('Персональный менеджер')
    expect(html).not.toContain('A manager of your own')
  })
})
