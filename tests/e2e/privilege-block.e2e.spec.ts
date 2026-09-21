import { expect, test } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The privileges section as a block (issue #120, `docs/legacy-inventory.md` section 5). The
 * cards and their offsets are the section's; where the two buttons under them lead is the
 * site's, and comes from the settings the header and the footer already read (issue #61).
 */
const SECTION = '[data-section="privilege"]'
const CARDS = `${SECTION} [data-cards="privilege"] > div`

test.describe('the privileges section', () => {
  test('is in the HTML the server sends, heading, privileges and invitation', async ({
    request,
  }) => {
    const html = await (await request.get(pathFor('/atm_jet_group', 'en'))).text()

    expect(html).toContain('data-section="privilege"')
    expect(html).toContain('Fly at cost')
    expect(html).toContain('Contact Key Account Manager')
  })

  test('comes to rest lower for each privilege the page carries', async ({ page }) => {
    await page.goto(pathFor('/atm_jet_group', 'en'))
    const cards = page.locator(CARDS)

    await expect(cards).toHaveCount(3)
    for (const [index, card] of (await cards.all()).entries())
      await expect(card).toHaveCSS('top', `${(index + 1) * 32}px`)
  })

  test('sends the two buttons where the site settings point', async ({ page }) => {
    await page.goto(pathFor('/atm_jet_group', 'en'))
    const section = page.locator(SECTION)

    // Links wearing the button rather than holding one, which is what issue #262 settled.
    await expect(section.getByRole('link', { name: 'Telegram' })).toHaveAttribute(
      'href',
      'https://t.me/melentev1',
    )
    await expect(section.getByRole('link', { name: 'WhatsApp' })).toHaveAttribute(
      'href',
      'https://wa.me/971504589926',
    )
  })

  test('speaks the language of the page it is on', async ({ request }) => {
    const html = await (await request.get(pathFor('/atm_jet_group', 'ru'))).text()

    expect(html).toContain('Летайте по себестоимости')
    expect(html).not.toContain('Fly at cost')
  })
})
