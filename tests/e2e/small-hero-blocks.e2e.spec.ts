import { expect, test } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The four page-local heroes (issue #133, `docs/legacy-inventory.md` section 4): the aircraft
 * listing's, the empty legs page's, the partners page's and the group page's. Three of them
 * count a figure up inside the heading; all four are words the legacy hard-coded into a page.
 */
test.describe('the small heroes', () => {
  test('are in the HTML the server sends, figures and all', async ({ request }) => {
    const [aircraft, emptyLegs, partners, group] = await Promise.all(
      ['/aircraft', '/empty_legs', '/partners', '/atm_jet_group'].map(async (route) =>
        (await request.get(pathFor(route, 'en'))).text(),
      ),
    )

    expect(aircraft).toContain('We have access to over ')
    expect(aircraft).toContain('50,000')
    expect(emptyLegs).toContain('75%')
    expect(emptyLegs).toContain('Empty legs is when an aircraft flies without passengers')
    expect(partners).toContain('4x')
    expect(group).toContain('since 2004')
  })

  test('head the page they open, each of them', async ({ page }) => {
    for (const [route, heading] of [
      ['/aircraft', 'We have access to over'],
      ['/empty_legs', 'We can save you on your flight with Empty legs'],
      ['/partners', 'more often'],
      ['/atm_jet_group', 'ATM JET Group'],
    ] as const) {
      await page.goto(pathFor(route, 'en'))

      await expect(page.getByRole('heading', { level: 1 })).toContainText(heading)
    }
  })

  test('draw the empty legs card with its photograph beside the words', async ({ page }) => {
    await page.goto(pathFor('/empty_legs', 'en'))
    const section = page.locator('[data-section="hero-empty-legs"]')
    const photo = await section.locator('img').boundingBox()
    const words = await section.getByRole('heading', { level: 2 }).boundingBox()

    expect(photo).not.toBeNull()
    expect(words).not.toBeNull()
    // Side by side from the large breakpoint up, which is the width this tier runs at.
    expect(words!.x).toBeGreaterThan(photo!.x)
  })

  test('speak the language of the page they are on', async ({ request }) => {
    const html = await (await request.get(pathFor('/atm_jet_group', 'ru'))).text()

    expect(html).toContain('с 2004 года')
    expect(html).not.toContain('since 2004')
  })
})
