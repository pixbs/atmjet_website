import { expect, test } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The options tiles as a block (issue #119, `docs/legacy-inventory.md` section 5). The legacy
 * hard-coded both pictures and both hrefs; the block names pages, so the slug decides the URL.
 *
 * The tile is one link, not a link holding a button: the legacy put a `<button>` inside the
 * link that wraps the whole tile, which is two tab stops for one destination (issue #262).
 */
const SECTION = '[data-section="options-tiles"]'

test.describe('the options tiles', () => {
  test('are in the HTML the server sends', async ({ request }) => {
    const html = await (await request.get(pathFor('/partners', 'en'))).text()

    expect(html).toContain('data-section="options-tiles"')
    expect(html).toContain('For personal assistants')
    expect(html).toContain('For agencies')
  })

  test('open the pages the block points at', async ({ page }) => {
    await page.goto(pathFor('/partners', 'en'))
    const section = page.locator(SECTION)

    await expect(section.getByRole('link', { name: /For personal assistants/ })).toHaveAttribute(
      'href',
      '/en/business_agents',
    )
    await expect(section.getByRole('link', { name: /For agencies/ })).toHaveAttribute(
      'href',
      '/en/partners',
    )
  })

  test('offer one way through per tile, not two', async ({ page }) => {
    await page.goto(pathFor('/partners', 'en'))

    // The label looks like a button; the tile around it is what a visitor clicks or tabs to.
    await expect(page.locator(SECTION).getByRole('link')).toHaveCount(2)
    await expect(page.locator(SECTION).getByRole('button')).toHaveCount(0)
  })

  test('speak the language of the page they are on', async ({ request }) => {
    const html = await (await request.get(pathFor('/partners', 'ru'))).text()

    expect(html).toContain('Персональным ассистентам')
    expect(html).not.toContain('For personal assistants')
  })
})
