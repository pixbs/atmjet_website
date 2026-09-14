import { expect, forEachLocale, test } from './fixtures'

/**
 * The home page is the `pages` document whose slug is empty (issue #60), so these assertions
 * follow the seeded content rather than the template placeholder that used to live here.
 * E8.1 fills the layout in; the title is what proves the document reached the browser.
 */
const TITLES = { en: 'Home', ru: 'Главная' } as const

/** The document title is the page's SEO title, which is seeded with the legacy strings (#170). */
const DOCUMENT_TITLES = {
  en: 'Private Jet Charter, Hire a Private Jet Worldwide',
  ru: 'Аренда частного самолета, заказать самолет в Москве и любой точке мира',
} as const

forEachLocale((locale) => {
  test.describe('Home', () => {
    test('is rendered on the server', async ({ home, request }) => {
      await home.expectServerRendered(request, TITLES[locale as keyof typeof TITLES])
    })

    test('shows the page a visitor asked for, in their locale', async ({ home, page }) => {
      await home.goto()

      await expect(page).toHaveTitle(DOCUMENT_TITLES[locale as keyof typeof DOCUMENT_TITLES])
      await expect(home.heading).toHaveText(TITLES[locale as keyof typeof TITLES])
    })
  })
})
