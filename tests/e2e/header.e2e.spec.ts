import { expect, forEachLocale, test } from './fixtures'
import { pathFor } from './routes'

/**
 * The site chrome (issue #88), reproducing `sections/header.tsx` and `sections/navbar.tsx`
 * (`docs/legacy-inventory.md` sections 3.2 and 3.3): a bar with the menu button and the logo,
 * and a menu that covers the viewport with the pages, the ways to reach ATM JET and the
 * language links.
 */
test.describe('the header', () => {
  test('is in the HTML the server sends, not painted afterwards', async ({ request }) => {
    // A site whose only navigation appears on hydration is one a crawler never navigates.
    const html = await (await request.get(pathFor('/styleguide', 'en'))).text()

    expect(html).toContain('data-section="header"')
    expect(html).toContain('aria-label="Open the menu"')
  })

  test('leaves the menu closed until it is asked for', async ({ header }) => {
    await header.goto()

    await expect(header.menu).toHaveCount(0)
    await expect(header.toggle).toHaveAttribute('aria-expanded', 'false')
  })

  test('opens and closes on the button, and says which it is doing', async ({ header }) => {
    await header.goto()
    await header.open()

    await expect(header.toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(header.toggle).toHaveAccessibleName('Close the menu')

    await header.toggle.click()
    await expect(header.menu).toHaveCount(0)
  })

  test('closes on Escape, which the legacy header did not offer', async ({ header }) => {
    await header.goto()
    await header.open()

    await header.page.keyboard.press('Escape')

    await expect(header.menu).toHaveCount(0)
    await expect(header.toggle).toHaveAttribute('aria-expanded', 'false')
  })

  test('holds the page still while the menu is over it', async ({ header }) => {
    await header.goto()
    const overflow = () => header.page.evaluate(() => document.body.style.overflow)

    await header.open()
    expect(await overflow()).toBe('hidden')

    await header.toggle.click()
    await expect(header.menu).toHaveCount(0)
    expect(await overflow()).toBe('auto')
  })

  test('takes the logo home', async ({ header }) => {
    await header.goto()

    await expect(header.logo).toHaveAttribute('href', pathFor('/', 'en'))
  })
})

forEachLocale((locale) => {
  test('the menu lists the pages the Header global names, in that language', async ({ header }) => {
    await header.goto()
    await header.open()

    const hrefs = await header
      .pageLinks()
      .evaluateAll((links) => links.map((link) => link.getAttribute('href')))

    // The seed fills both columns with the twelve pages of the legacy menu (issue #61).
    expect(hrefs).toContain(pathFor('/', locale))
    expect(hrefs).toContain(pathFor('/partners', locale))

    // Every one of them carries the locale prefix. The legacy Home link did not, which is why
    // it depended on the middleware guessing the language (section 13, entry 8).
    for (const href of hrefs) expect(href).toMatch(new RegExp(`^/${locale}(/|$)`))
  })

  test('the menu offers the ways to reach ATM JET that the settings hold', async ({ header }) => {
    await header.goto()
    await header.open()

    // Built from the bare handles an editor keeps, so the legacy `tg:\\nesolve?domain=` cannot
    // come back (`docs/legacy-inventory.md` section 13, and src/lib/links.ts).
    await expect(header.menu.getByRole('link', { name: 'Telegram' })).toHaveAttribute(
      'href',
      /^https:\/\/t\.me\//,
    )
    await expect(header.menu.getByRole('link', { name: 'WhatsApp' })).toHaveAttribute(
      'href',
      /^https:\/\/wa\.me\/\d+$/,
    )
  })

  test('the booking button opens the dialog on the page the visitor is reading', async ({
    header,
  }) => {
    await header.goto()
    await header.open()

    // The query is the dialog's contract (E6.6) and `Header` is what the lead is tagged with.
    for (const href of await header
      .booking()
      .evaluateAll((links) => links.map((link) => link.getAttribute('href')))) {
      expect(href).toBe(`${pathFor('/styleguide', locale)}?showBooking=Header`)
    }
  })

  test('the menu closes itself when it takes the visitor somewhere', async ({ header }) => {
    await header.goto()
    await header.open()

    await header.pageLinks().first().click()

    await expect(header.menu).toHaveCount(0)
  })
})
