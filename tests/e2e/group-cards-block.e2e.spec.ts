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
    expect(html).toContain('Jet hire - from 10 flights every day.')
  })

  test('open the pages they name, with one slash', async ({ page }) => {
    await page.goto(pathFor('/atm_jet_group', 'en'))
    const section = page.locator(SECTION)

    // Both cards carry the same wording, as the legacy pair did, so they are told apart by
    // the page each one opens.
    const links = section.getByRole('link', { name: 'Request now' })

    await expect(links.first()).toHaveAttribute('href', '/en/aircraft')
    await expect(links.last()).toHaveAttribute('href', '/en/sales_dept')
  })

  test('rule one card off from the next, and not the first', async ({ page }) => {
    await page.goto(pathFor('/atm_jet_group', 'en'))

    // Two cards on this page, so one rule between them.
    await expect(page.locator(`${SECTION} hr`)).toHaveCount(1)
  })

  test('fetch the photograph the page opens on with the markup', async ({ page }) => {
    await page.goto(pathFor('/atm_jet_group', 'en'))
    const photographs = page.locator(`${SECTION} img`)

    // The page has no hero, so the first card is what it is measured by (issue #176); the one
    // under it waits to be scrolled to, as every other photograph on the site does.
    await expect(photographs.first()).not.toHaveAttribute('loading', 'lazy')
    await expect(photographs.last()).toHaveAttribute('loading', 'lazy')
  })

  test('speak the language of the page they are on', async ({ request }) => {
    const html = await (await request.get(pathFor('/atm_jet_group', 'ru'))).text()

    expect(html).toContain('Запросить сейчас')
    expect(html).not.toContain('Request now')
  })
})
