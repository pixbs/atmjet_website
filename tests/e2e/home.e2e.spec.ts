import { expect, forEachLocale, test } from './fixtures'

/**
 * The home page is the `pages` document whose slug is empty (issue #60). Its first section is
 * the hero video (issue #111), so the words a visitor is met by — and the `h1` of the document —
 * are the hero's, where a page whose sections are not ported yet still falls back to its title.
 * The strings are the ones `scripts/seed/pages.ts` lands.
 */
const HEADINGS = {
  en: 'Flying private made simple',
  ru: 'Частные перелёты — это просто',
} as const

/** The document title is the page's SEO title, which is seeded with the legacy strings (#170). */
const DOCUMENT_TITLES = {
  en: 'Private Jet Charter, Hire a Private Jet Worldwide',
  ru: 'Аренда частного самолета, заказать самолет в Москве и любой точке мира',
} as const

forEachLocale((locale) => {
  test.describe('Home', () => {
    test('is rendered on the server', async ({ home, request }) => {
      await home.expectServerRendered(request, HEADINGS[locale as keyof typeof HEADINGS])
    })

    test('shows the page a visitor asked for, in their locale', async ({ home, page }) => {
      await home.goto()

      await expect(page).toHaveTitle(DOCUMENT_TITLES[locale as keyof typeof DOCUMENT_TITLES])
      await expect(home.heading).toHaveText(HEADINGS[locale as keyof typeof HEADINGS])
    })
  })
})
