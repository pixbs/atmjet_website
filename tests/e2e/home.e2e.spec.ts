import { expect, forEachLocale, test } from './fixtures'
import { pathFor, type Locale } from './routes'

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

/**
 * The eleven sections the legacy home page drew, in its order (issue #134, section 4). The two
 * forms a section carries inside it are chrome, as they are on every other page.
 */
const SECTIONS = [
  'hero-video',
  'make-booking',
  'why-us',
  'empty-legs',
  'key-features',
  'options-tiles',
  'privilege',
  'yachts-promo',
  'tiles',
  'transfer',
  'faq',
]

const CHROME = ['header', 'footer', 'cookie-banner', 'booking-form', 'request-form', 'angle-bar']

/** The page's own sections, in the order the document has them. */
const sectionsOf = (html: string): string[] =>
  [...html.matchAll(/data-section="([a-z-]+)"/g)]
    .map((match) => match[1] ?? '')
    .filter((name) => !CHROME.includes(name))

forEachLocale((locale) => {
  test.describe('Home', () => {
    test('is rendered on the server', async ({ home, request }) => {
      await home.expectServerRendered(request, HEADINGS[locale as keyof typeof HEADINGS])
    })

    test('is its eleven sections, in the order the legacy page had them', async ({ request }) => {
      const html = await (await request.get(pathFor('/', locale as Locale))).text()

      // In order, and nothing else: a section on the wrong page shows up here as an extra.
      expect(sectionsOf(html)).toEqual(SECTIONS)
    })

    test('draws the curtain the legacy drew over this page alone', async ({ request }) => {
      // The preloader is a curtain, not a loading screen: the page is already behind it in the
      // HTML the server sends (issue #92, section 3.8).
      const html = await (await request.get(pathFor('/', locale as Locale))).text()

      expect(html).toContain('preloader-backdrop')
      expect(html).toContain(HEADINGS[locale as keyof typeof HEADINGS])
      expect(await (await request.get(pathFor('/yachts', locale as Locale))).text()).not.toContain(
        'preloader-backdrop',
      )
    })

    test('shows the page a visitor asked for, in their locale', async ({ home, page }) => {
      await home.goto()

      await expect(page).toHaveTitle(DOCUMENT_TITLES[locale as keyof typeof DOCUMENT_TITLES])
      await expect(home.heading).toHaveText(HEADINGS[locale as keyof typeof HEADINGS])
    })
  })
})
