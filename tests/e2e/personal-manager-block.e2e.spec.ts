import { expect, test } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The personal manager (issue #124, `docs/legacy-inventory.md` section 5): the gold heading, the
 * sentence and the chips, with the photograph beside them.
 */
const SECTION = '[data-section="personal-manager"]'

test.describe('the personal manager', () => {
  test('is in the HTML the server sends, chips and all', async ({ request }) => {
    const html = await (await request.get(pathFor('/partners', 'en'))).text()

    expect(html).toContain('data-section="personal-manager"')
    expect(html).toContain('A manager who knows the flight')
    expect(html).toContain('Permits')
    expect(html).toContain('Transfers')
  })

  test('draws one box per chip the block carries', async ({ page }) => {
    await page.goto(pathFor('/partners', 'en'))
    const chips = page.locator(SECTION).locator('.flex-row.flex-wrap > p')

    await expect(chips).toHaveCount(5)
  })

  test('leaves out the stray word and the debug background the legacy drew', async ({ page }) => {
    await page.goto(pathFor('/partners', 'en'))
    const section = page.locator(SECTION)
    const picture = section.locator('img').locator('..')

    // The legacy section rendered a literal `aaa` behind `bg-red-50` (section 13, entry 22);
    // dropping both is the decision on issue #124.
    await expect(section).not.toContainText('aaa')
    await expect(picture).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  })

  test('speaks the language of the page it is on', async ({ request }) => {
    const html = await (await request.get(pathFor('/sales_dept', 'ru'))).text()

    expect(html).toContain('Менеджер, который знает рейс')
    expect(html).toContain('Разрешения')
    expect(html).not.toContain('A manager who knows the flight')
  })
})
