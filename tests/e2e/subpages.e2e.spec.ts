import { expect, test, type APIRequestContext } from '@playwright/test'

import { ENABLED_LOCALES, pathFor, type Locale } from './routes'

/**
 * The subpages that are their sections and nothing else (issues #144, #146, #143, #150, #147, #145 and #141,
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
    slug: 'group_charters',
    sections: ['hero-subpage', 'make-booking', 'why-us', 'contact-us'],
    titles: { en: 'Group charters', ru: 'Групповые перевозки' },
    words: { en: 'One aircraft, one price', ru: 'Один борт, одна цена' },
  },
  {
    slug: 'sales_yachts',
    sections: [
      'hero-yachts',
      'key-features',
      'framed-descriptor',
      'recent-yachts',
      'we-inspect',
      'options-selection',
      'photo-descriptor',
      'why-us',
      'contact-us',
    ],
    titles: { en: 'Yachts for sale', ru: 'Яхты на продажу' },
    words: {
      en: 'Every yacht we list, we have stood on',
      ru: 'На каждой яхте из списка мы стояли сами',
    },
  },
] as const

async function documentOf(request: APIRequestContext, path: string): Promise<string> {
  const response = await request.get(path)

  expect(response.status(), path).toBe(200)

  return response.text()
}

/** Where each section starts in the document, so their order can be compared with the legacy. */
const orderOf = (html: string, sections: readonly string[]): string[] =>
  sections
    .map((name) => ({ name, at: html.indexOf(`data-section="${name}"`) }))
    .filter((section) => section.at >= 0)
    .sort((one, other) => one.at - other.at)
    .map((section) => section.name)

for (const page of PAGES) {
  test.describe(`/${page.slug}`, () => {
    test('is rendered on the server, in the order the legacy page had', async ({ request }) => {
      const html = await documentOf(request, pathFor(`/${page.slug}`, 'en'))

      expect(orderOf(html, page.sections)).toEqual([...page.sections])
      expect(html).toContain(page.words.en)
    })

    test('draws nothing the legacy page did not', async ({ request }) => {
      const html = await documentOf(request, pathFor(`/${page.slug}`, 'en'))
      const drawn = [...html.matchAll(/data-section="([a-z-]+)"/g)].map((match) => match[1])

      // The chrome every page inherits, and the sections this one is made of. Anything else is
      // a section on the wrong page.
      const chrome = ['header', 'footer', 'cookie-banner', 'booking-form', 'request-form']
      expect(drawn.filter((name) => !chrome.includes(name!)).sort()).toEqual(
        [...page.sections].sort(),
      )
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
