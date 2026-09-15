import { expect, test, type APIRequestContext } from '@playwright/test'

import { ENABLED_LOCALES, pathFor, type Locale } from './routes'

/**
 * The subpages that are their sections and nothing else (issues #144, #146, #143, #150,
 * #147 and #148,
 * `docs/legacy-inventory.md` section 4): what they are made of, in the order the legacy page
 * had them, and what they tell a crawler.
 *
 * The legacy pages were React files with their sections hard-coded and, bar the home page, no
 * metadata at all (section 2.4). They are documents now, so what is asserted is the order the
 * seed lands and the head the server sends for it.
 */
const PAGES = [
  {
    slug: 'cargo_charter',
    sections: ['hero-subpage', 'why-us', 'contact-us'],
    titles: { en: 'Cargo charter', ru: 'Грузовые перевозки' },
    words: { en: 'Freight where a scheduled service will not go.', ru: 'Грузы туда, куда' },
  },
  {
    slug: 'medical_aviation',
    sections: ['hero-subpage', 'key-features', 'contact-us'],
    titles: { en: 'Medical aviation', ru: 'Медицинская авиация' },
    words: { en: 'An intensive care unit at cruising altitude.', ru: 'Реанимация на высоте' },
  },
  {
    slug: 'empty_legs',
    sections: ['hero-empty-legs', 'descriptor', 'empty-legs', 'contact-us'],
    titles: { en: 'Empty legs', ru: 'Пустые перелёты' },
    words: { en: 'The aircraft is going anyway', ru: 'Борт всё равно летит' },
  },
  {
    slug: 'atm_jet_group',
    sections: ['hero-group', 'group-cards', 'yachts-promo', 'privilege'],
    titles: { en: 'ATM JET Group', ru: 'Группа ATM JET' },
    words: { en: 'The group behind the flight', ru: 'Группа, которая стоит за рейсом' },
  },
  {
    slug: 'business_agents',
    sections: ['guide', 'why-us', 'documents', 'transfer', 'best-price'],
    titles: { en: 'Business agents', ru: 'Бизнес-агентам' },
    words: { en: 'Why select us?', ru: 'Почему выбирают нас?' },
  },
  {
    slug: 'partners',
    // Two stacks of reasons, which is what the legacy page drew: the clients' and the offer.
    sections: ['hero-partners', 'why-us', 'why-us', 'personal-manager', 'contact-us'],
    titles: { en: 'Partners', ru: 'Партнёры' },
    words: { en: 'Clients benefit', ru: 'Клиенты выбирают нас' },
  },
] as const

async function documentOf(request: APIRequestContext, path: string): Promise<string> {
  const response = await request.get(path)

  expect(response.status(), path).toBe(200)

  return response.text()
}

/**
 * The chrome every page inherits, and the two forms a section may carry inside it. Everything
 * else a document marks as a section is one of the page's own.
 */
const CHROME = ['header', 'footer', 'cookie-banner', 'booking-form', 'request-form']

/** The page's own sections, in the order the document has them — twice, where it has one twice. */
const sectionsOf = (html: string): string[] =>
  [...html.matchAll(/data-section="([a-z-]+)"/g)]
    .map((match) => match[1] ?? '')
    .filter((name) => !CHROME.includes(name))

for (const page of PAGES) {
  test.describe(`/${page.slug}`, () => {
    test('is rendered on the server, in the order the legacy page had', async ({ request }) => {
      const html = await documentOf(request, pathFor(`/${page.slug}`, 'en'))

      // In order, and nothing else: a section on the wrong page shows up here as an extra.
      expect(sectionsOf(html)).toEqual([...page.sections])
      expect(html).toContain(page.words.en)
    })

    for (const locale of ENABLED_LOCALES) {
      test(`[${locale}] says it in the language of the page, and titles itself`, async ({
        request,
      }) => {
        const html = await documentOf(request, pathFor(`/${page.slug}`, locale))
        const title = html.match(/<title>([^<]*)<\/title>/)?.[1]

        // The legacy layout computed a title and never returned it, so every page had none.
        expect(title).toBe(page.titles[locale as Locale as 'en'])
        expect(html).toContain(page.words[locale as Locale as 'en'])
      })
    }
  })
}
