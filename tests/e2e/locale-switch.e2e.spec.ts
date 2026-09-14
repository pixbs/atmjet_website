import { expect, test } from '@playwright/test'

import { ENABLED_LOCALES, LOCALES, pathFor } from './routes'

/**
 * Switching language (issue #90), reproducing `elements/localeSwitcher.tsx`
 * (`docs/legacy-inventory.md` section 3.6): the languages side by side, the one being read
 * dimmed, and the visitor kept on the page and the query they arrived with.
 */
const SWITCH = '[data-section="locale-switch"] nav'

test.describe('the language links', () => {
  test('are in the HTML the server sends, not painted afterwards', async ({ request }) => {
    // A navigation element that only appears after hydration is one a crawler never sees.
    const html = await (await request.get(pathFor('/styleguide', 'en'))).text()

    expect(html).toContain('>Eng<')
    expect(html).toContain('>Рус<')
  })

  test('offer every language the site serves, and no other', async ({ page }) => {
    await page.goto(pathFor('/styleguide', 'en'))
    const links = page.locator(`${SWITCH} a`)

    await expect(links).toHaveCount(ENABLED_LOCALES.length)

    const hidden = LOCALES.filter((locale) => !ENABLED_LOCALES.includes(locale))
    for (const locale of hidden) {
      // `uk` is entered in the admin but not enabled in the settings (issue #53).
      await expect(page.locator(`${SWITCH} a[href^="/${locale}"]`)).toHaveCount(0)
    }
  })

  test('dim the language being read and leave the others alone', async ({ page }) => {
    await page.goto(pathFor('/styleguide', 'ru'))

    const current = page.locator(`${SWITCH} a[aria-current="true"]`)
    await expect(current).toHaveText('Рус')
    await expect(current).toHaveClass(/opacity-50/)

    const other = page.locator(`${SWITCH} a:not([aria-current])`)
    await expect(other).toHaveText('Eng')
    // The legacy inactive link carried the literal class `false` (section 13, entry 74).
    await expect(other).not.toHaveClass(/\bfalse\b/)
  })

  test('keep the visitor on the page they were reading', async ({ page }) => {
    await page.goto(pathFor('/styleguide', 'en'))
    await page.locator(`${SWITCH} a`, { hasText: 'Рус' }).click()

    await expect(page).toHaveURL(new RegExp(`${pathFor('/styleguide', 'ru')}$`))
    await expect(page.locator('html')).toHaveAttribute('lang', 'ru')
  })

  test('carry the query across the switch', async ({ page }) => {
    // The legacy site opened its booking dialog from the query, so losing it closed the dialog.
    await page.goto(`${pathFor('/styleguide', 'en')}?showBooking=1`)
    await page.locator(`${SWITCH} a`, { hasText: 'Рус' }).click()

    // `toHaveURL` retries, which `page.url()` does not: the click starts the navigation.
    await expect(page).toHaveURL(new RegExp(`${pathFor('/styleguide', 'ru')}\\?showBooking=1$`))
  })

  test('offer a plain URL when there is no query to carry', async ({ page }) => {
    // The legacy switcher appended a bare `?` whatever the query held.
    await page.goto(pathFor('/styleguide', 'en'))
    const href = await page.locator(`${SWITCH} a`, { hasText: 'Рус' }).getAttribute('href')

    expect(href).toBe(pathFor('/styleguide', 'ru'))
  })
})
