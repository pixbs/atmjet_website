import { expect, test } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The group cards as a block (issue #130, `docs/legacy-inventory.md` section 4). The legacy
 * built `/${locale}/${href}` around an href that already began with a slash, so both cards led
 * to `/en//aircraft` (section 13, entry 9); the block names a page and its slug decides the URL.
 */
const SECTION = '[data-section="group-cards"]'

test.describe('the group cards', () => {
  test('are in the HTML the server sends', async ({ request }) => {
    const html = await (await request.get(pathFor('/atm_jet_group', 'en'))).text()

    expect(html).toContain('data-section="group-cards"')
    expect(html).toContain('Owned and managed aircraft, from light jets to airliners.')
  })

  test('open the pages they name, with one slash', async ({ page }) => {
    await page.goto(pathFor('/atm_jet_group', 'en'))
    const section = page.locator(SECTION)

    await expect(section.getByRole('link', { name: 'See the fleet' })).toHaveAttribute(
      'href',
      '/en/aircraft',
    )
    await expect(section.getByRole('link', { name: 'Talk to sales' })).toHaveAttribute(
      'href',
      '/en/sales_dept',
    )
  })

  test('rule one card off from the next, and not the first', async ({ page }) => {
    await page.goto(pathFor('/atm_jet_group', 'en'))

    // Two cards on this page, so one rule between them.
    await expect(page.locator(`${SECTION} hr`)).toHaveCount(1)
  })

  test('speak the language of the page they are on', async ({ request }) => {
    const html = await (await request.get(pathFor('/atm_jet_group', 'ru'))).text()

    expect(html).toContain('Посмотреть флот')
    expect(html).not.toContain('See the fleet')
  })
})
