import { expect, test } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The two cards that carry a picture and a button (issue #103,
 * `docs/legacy-inventory.md` section 6). What is worth asserting about either is where its
 * button goes: the group card's link is the one the legacy site got wrong.
 */
const SECTION = '[data-section="cards"]'

test.describe('the group card', () => {
  test('is in the HTML the server sends', async ({ request }) => {
    const html = await (await request.get(pathFor('/styleguide', 'en'))).text()

    expect(html).toContain('data-section="cards"')
    expect(html).toContain('See the aircraft')
  })

  test('links to the page once, whether or not the path was stored with a slash', async ({
    page,
  }) => {
    await page.goto(pathFor('/styleguide', 'en'))
    const section = page.locator(SECTION)

    // The legacy card wrapped the locale around an href that already began with a slash, so
    // both cards on `/atm_jet_group` linked to `/en//aircraft` (section 13, entry 9).
    await expect(section.getByRole('link', { name: 'See the aircraft' })).toHaveAttribute(
      'href',
      '/en/aircraft',
    )
    await expect(section.getByRole('link', { name: 'Talk to sales' })).toHaveAttribute(
      'href',
      '/en/sales_dept',
    )
  })

  test('carries the locale of the page it is read on', async ({ page }) => {
    await page.goto(pathFor('/styleguide', 'ru'))

    // The card is given a path with no locale in it; `Link` adds the one being read.
    await expect(
      page.locator(SECTION).getByRole('link', { name: 'See the aircraft' }),
    ).toHaveAttribute('href', '/ru/aircraft')
  })

  test('draws its photograph under the copy', async ({ page }) => {
    await page.goto(pathFor('/styleguide', 'en'))
    const photo = page.locator(SECTION).locator('img').first()

    // A lazy image is only fetched once it is near the viewport.
    await photo.scrollIntoViewIfNeeded()
    await expect(photo).toHaveJSProperty('complete', true)
  })
})

test.describe('the file card', () => {
  test('opens the document in a new tab, at the address it was given', async ({ page }) => {
    await page.goto(pathFor('/styleguide', 'en'))
    const document = page.locator(SECTION).getByRole('link', { name: 'Download' }).first()

    // An address outside this site: no locale in front of it, whatever page it sits on.
    await expect(document).toHaveAttribute(
      'href',
      /^https:\/\/atmjet\.ams3\.cdn\.digitaloceanspaces\.com\//,
    )
    await expect(document).toHaveAttribute('target', '_blank')
  })
})
