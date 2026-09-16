import { expect, test } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The first section to reach a page from the layout (issue #112,
 * `docs/legacy-inventory.md` section 5). The legacy passed its three props from a page file, so
 * what is worth asserting is that they now come from the document, in the language asked for,
 * and that they are in the markup the server sends rather than filled in afterwards.
 */
test.describe('the subpage hero', () => {
  test('is in the HTML the server sends, words and photograph', async ({ request }) => {
    const html = await (await request.get(pathFor('/cargo_charter', 'en'))).text()

    expect(html).toContain('data-section="hero-subpage"')
    expect(html).toContain('Freight where a scheduled service will not go.')
    // Fetched with the markup rather than when it scrolls into view: the legacy marked every
    // hero `loading='lazy'` (section 13, entry 15).
    expect(html).toContain('rel="preload" as="image"')
  })

  test('speaks the language of the page it opens', async ({ request }) => {
    const html = await (await request.get(pathFor('/cargo_charter', 'ru'))).text()

    expect(html).toContain('Грузы туда, куда не летают регулярные рейсы.')
  })

  test('is the heading of the page, which the title above it used to be', async ({ page }) => {
    await page.goto(pathFor('/medical_aviation', 'en'))

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Medical aviation')
  })

  test('opens a page that has no sentence under the heading', async ({ page }) => {
    // The legacy citizens page passed an empty description and kept the gap it left; it is the
    // page that answers in Russian alone (issue #149).
    await page.goto(pathFor('/citizens', 'ru'))
    const hero = page.locator('[data-section="hero-subpage"]')

    await expect(hero.getByRole('heading', { name: 'Гражданам' })).toBeVisible()
    await expect(hero.locator('p')).toBeEmpty()
  })

  test('leaves a page with no sections rendering its title', async ({ request }) => {
    // Nothing of E7 has reached the partners page yet, so it still renders what it always did.
    const html = await (await request.get(pathFor('/partners', 'en'))).text()

    expect(html).toContain('Partners')
    expect(html).not.toContain('data-section="hero-subpage"')
  })
})
