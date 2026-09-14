import type { Payload } from 'payload'

import { PAGE_SLUGS } from '../../src/collections/Pages'
import { DEFAULT_LOCALES } from '../../src/i18n/locales'
import type { Page } from '../../src/payload-types'
import type { SeedOutcome } from './report'

/**
 * One published page per static route (issue #60, E2.5). The legacy yachts page crashed on
 * empty data, so every environment starts with something to render rather than nothing.
 *
 * Titles are placeholders an editor replaces; the English ones read as the legacy navigation
 * labels so the seeded site is recognisable. Sections land in the layout as each block's issue
 * ports them (E7); the copy is placeholder too, until the content migration (E10.3).
 */
const TITLES: Record<string, { en: string; ru: string }> = {
  '': { en: 'Home', ru: 'Главная' },
  aircraft: { en: 'Aircraft', ru: 'Самолёты' },
  atm_jet_group: { en: 'ATM JET Group', ru: 'Группа ATM JET' },
  business_agents: { en: 'Business agents', ru: 'Бизнес-агентам' },
  cargo_charter: { en: 'Cargo charter', ru: 'Грузовые перевозки' },
  citizens: { en: 'Citizens', ru: 'Гражданам' },
  empty_legs: { en: 'Empty legs', ru: 'Пустые перелёты' },
  group_charters: { en: 'Group charters', ru: 'Групповые перевозки' },
  medical_aviation: { en: 'Medical aviation', ru: 'Медицинская авиация' },
  partners: { en: 'Partners', ru: 'Партнёры' },
  sales_dept: { en: 'Sales department', ru: 'Отдел продаж' },
  sales_yachts: { en: 'Yachts for sale', ru: 'Яхты на продажу' },
  yachts: { en: 'Yacht charter', ru: 'Аренда яхт' },
}

/**
 * The metadata the legacy site intended (issue #170). Only its home page ever exported any
 * (`docs/legacy-inventory.md` section 2.4); every other route falls back to its title and the
 * site description, which is what an editor then replaces in the admin.
 */
const META: Record<string, Record<string, { title: string; description: string }>> = {
  '': {
    en: {
      title: 'Private Jet Charter, Hire a Private Jet Worldwide',
      description:
        'Hire a private jet within a few hours.✈ Book a private jet London, and other cities and countries.',
    },
    ru: {
      title: 'Аренда частного самолета, заказать самолет в Москве и любой точке мира',
      description:
        'Арендовать частный самолет в течение нескольких часов.✈ заказать частный самолет в Москве, других городах и странах.',
    },
  },
}

/**
 * The four pages the subpage hero opens (issue #112, `docs/legacy-inventory.md` section 5).
 * The citizens page passed no sentence at all, which is the shape the block has to keep.
 */
const HERO_PAGES: Record<string, Record<'en' | 'ru', string>> = {
  cargo_charter: {
    en: 'Freight where a scheduled service will not go.',
    ru: 'Грузы туда, куда не летают регулярные рейсы.',
  },
  citizens: { en: '', ru: '' },
  group_charters: {
    en: 'One aircraft for the whole party, at a price agreed once.',
    ru: 'Один самолёт на всю группу по цене, согласованной один раз.',
  },
  medical_aviation: {
    en: 'An intensive care unit at cruising altitude.',
    ru: 'Реанимация на высоте крейсерского полёта.',
  },
}

/**
 * The reasons the cargo charter page stacks (issue #116, section 5). Three of them, because the
 * three shapes the card comes in are what a fixture is for: with a figure and a photograph, and
 * with neither.
 */
const WHY_US: {
  figure?: string
  withImage: boolean
  en: [string, string]
  ru: [string, string]
}[] = [
  {
    figure: '20+',
    withImage: true,
    en: ['Years in the air', 'Two decades of charters out of the Gulf, Europe and the CIS.'],
    ru: ['Лет в воздухе', 'Двадцать лет чартеров из Залива, Европы и СНГ.'],
  },
  {
    figure: '24/7',
    withImage: true,
    en: ['Answered at any hour', 'A manager who knows the flight, not a call centre.'],
    ru: ['Отвечаем в любой час', 'Менеджер, который знает рейс, а не колл-центр.'],
  },
  {
    withImage: false,
    en: ['A price agreed once', 'What is quoted is what is invoiced, fuel and handling in.'],
    ru: [
      'Цена, согласованная один раз',
      'Сколько названо, столько и в счёте, с топливом и наземкой.',
    ],
  },
]

/**
 * The features the medical aviation page shows (issue #118, section 5). Four of them, as the
 * legacy page passed.
 */
const KEY_FEATURES: { en: [string, string]; ru: [string, string] }[] = [
  {
    en: ['An intensive care cabin', 'A stretcher, a ventilator and the monitoring beside it.'],
    ru: ['Реанимационная кабина', 'Носилки, аппарат ИВЛ и мониторинг рядом с ними.'],
  },
  {
    en: ['A doctor on board', 'The crew flies with the team the case needs, not the other way.'],
    ru: ['Врач на борту', 'Экипаж летит с той бригадой, которой требует случай.'],
  },
  {
    en: ['Wheels up in hours', 'Permits, slots and the ambulance at both ends, arranged here.'],
    ru: ['Вылет за часы', 'Разрешения, слоты и скорая с обеих сторон — на нас.'],
  },
  {
    en: ['Door to door', 'The flight is one leg of a journey that starts and ends at a bed.'],
    ru: ['От двери до двери', 'Перелёт — одно плечо пути, который начинается и кончается у койки.'],
  },
]

type Layout = NonNullable<Page['layout']>

/** What the seeded sections are built out of: the placeholder uploads and the pages they link to. */
interface Fixture {
  photo: number
  surface: number
  pages: ReadonlyMap<string, number>
}

/**
 * The privileges the group page stacks (issue #120, section 5), one per icon the legacy drew,
 * and the invitation under them.
 */
const PRIVILEGES: {
  icon: 'plane' | 'exchange' | 'diamond'
  en: [string, string]
  ru: [string, string]
}[] = [
  {
    icon: 'plane',
    en: [
      'A jet within three hours',
      'An aircraft ready at the nearest airport, whatever the hour.',
    ],
    ru: ['Самолёт за три часа', 'Борт готов в ближайшем аэропорту в любое время суток.'],
  },
  {
    icon: 'exchange',
    en: ['One price, agreed once', 'What is quoted is what is invoiced, with nothing added later.'],
    ru: [
      'Одна цена, согласованная один раз',
      'Сколько названо, столько и в счёте, без добавлений.',
    ],
  },
  {
    icon: 'diamond',
    en: ['The cabin as you left it', 'Crew, catering and cabin kept to the standard you set.'],
    ru: [
      'Салон таким, каким вы его оставили',
      'Экипаж, кейтеринг и салон — по заданному стандарту.',
    ],
  },
]

/** What the yachts promotion offers, in the three columns the legacy card carried. */
const YACHT_COLUMNS: { en: [string, string]; ru: [string, string] }[] = [
  {
    en: ['The fleet', 'Motor yachts and sailing yachts from 20 to 100 metres.'],
    ru: ['Флот', 'Моторные и парусные яхты от 20 до 100 метров.'],
  },
  {
    en: ['The crew', 'Captain, chef and stewardesses chosen for the party aboard.'],
    ru: ['Экипаж', 'Капитан, шеф-повар и стюардессы под конкретную компанию.'],
  },
  {
    en: ['The week', 'Berths, permits and the transfer from the airport, arranged here.'],
    ru: ['Неделя', 'Стоянки, разрешения и трансфер из аэропорта — на нас.'],
  },
]

/** The sections a seeded page starts with; a page with no entry here starts with none. */
function layoutFor(slug: string, locale: 'en' | 'ru', fixture: Fixture): Layout {
  const sections: Layout = []
  const description = HERO_PAGES[slug]?.[locale]

  if (description !== undefined)
    sections.push({
      blockType: 'heroSubpage',
      title: TITLES[slug][locale],
      description,
      image: fixture.photo,
    })

  if (slug === 'medical_aviation')
    sections.push({
      blockType: 'keyFeatures',
      title: locale === 'en' ? 'What is on board' : 'Что на борту',
      description:
        locale === 'en'
          ? 'The aircraft is fitted for the patient, not for the route.'
          : 'Самолёт оснащается под пациента, а не под маршрут.',
      cards: KEY_FEATURES.map((card) => ({
        title: card[locale][0],
        description: card[locale][1],
        image: fixture.photo,
      })),
    })

  if (slug === 'cargo_charter')
    sections.push({
      blockType: 'whyUs',
      title: locale === 'en' ? 'Why us' : 'Почему мы',
      description:
        locale === 'en'
          ? 'What a charter with us comes with, whatever is in the hold.'
          : 'Что входит в чартер с нами, что бы ни было в трюме.',
      cards: WHY_US.map((card) => ({
        figure: card.figure,
        title: card[locale][0],
        description: card[locale][1],
        image: card.withImage ? fixture.photo : undefined,
      })),
    })

  if (slug === 'atm_jet_group')
    sections.push({
      blockType: 'privilege',
      title: locale === 'en' ? 'What flying with us' : 'Что даёт полёт',
      goldTitle: locale === 'en' ? 'comes with' : 'с нами',
      cards: PRIVILEGES.map((card) => ({
        icon: card.icon,
        title: card[locale][0],
        description: card[locale][1],
      })),
      contact: {
        title: locale === 'en' ? 'Tell us where you are going' : 'Расскажите, куда летите',
        description:
          locale === 'en'
            ? 'A manager answers within minutes, at any hour, in either language.'
            : 'Менеджер отвечает в течение нескольких минут, в любой час, на любом языке.',
        telegram: 'Telegram',
        whatsapp: 'WhatsApp',
        background: fixture.surface,
      },
    })

  const yachts = fixture.pages.get('yachts')
  if (slug === 'atm_jet_group' && yachts !== undefined)
    sections.push({
      blockType: 'yachtsPromo',
      title: locale === 'en' ? 'Yachts' : 'Яхты',
      description:
        locale === 'en'
          ? 'The same crew arranges the week that follows the flight.'
          : 'Та же команда организует неделю, которая следует за перелётом.',
      image: fixture.photo,
      columns: YACHT_COLUMNS.map((column) => ({
        title: column[locale][0],
        description: column[locale][1],
      })),
      invitation: {
        image: fixture.photo,
        title: locale === 'en' ? 'Tell us the week and the water' : 'Назовите неделю и место',
        label: locale === 'en' ? 'See the fleet' : 'Посмотреть флот',
        page: yachts,
      },
    })

  return sections
}

/**
 * The same sections in another language, keeping every id the English write handed out. Payload
 * matches a block, and a row inside it, by id; a write without them replaces the rows instead of
 * translating them, and the English words go with the rows that held them.
 */
function translated(layout: Layout | null | undefined, slug: string, fixture: Fixture): Layout {
  return layoutFor(slug, 'ru', fixture).map((block, index) => {
    const written = layout?.[index]
    const id = written?.id
    const rows = written && 'cards' in written ? written.cards : undefined

    // One case per block type: a spread over the union widens every field back to optional.
    switch (block.blockType) {
      case 'heroSubpage':
        return { ...block, id }
      case 'keyFeatures':
        return { ...block, id, cards: withRowIds(block.cards ?? [], rows) }
      case 'privilege':
        return { ...block, id, cards: withRowIds(block.cards ?? [], rows) }
      case 'whyUs':
        return { ...block, id, cards: withRowIds(block.cards ?? [], rows) }
      case 'yachtsPromo':
        return {
          ...block,
          id,
          columns: withRowIds(
            block.columns ?? [],
            written?.blockType === 'yachtsPromo' ? written.columns : undefined,
          ),
        }
    }
  })
}

/** The rows of a section, wearing the ids the English write gave the same rows. */
function withRowIds<Row>(rows: Row[], written: { id?: string | null }[] | null | undefined): Row[] {
  return rows.map((row, index) => ({ ...row, id: written?.[index]?.id }))
}

/**
 * Gives a page that predates a block the sections that block's issue seeds, appended after the
 * ones it already has and leaving those alone: a database seeded between two block issues would
 * otherwise never see the second one, and an editor's words are not the fixture's to overwrite.
 */
async function addSections(
  payload: Payload,
  page: Page,
  slug: string,
  fixture: Fixture,
): Promise<'updated' | 'unchanged'> {
  const current = page.layout ?? []
  const has = new Set(current.map((block) => block.blockType))
  const missing = layoutFor(slug, 'en', fixture).filter((block) => !has.has(block.blockType))
  if (missing.length === 0) return 'unchanged'

  const id = page.id
  const written = await payload.update({
    collection: 'pages',
    id,
    data: { layout: [...current, ...missing] },
    locale: 'en',
    overrideAccess: true,
    context: { skipRevalidation: true },
  })

  for (const locale of DEFAULT_LOCALES.filter((entry) => entry !== 'en'))
    await payload.update({
      collection: 'pages',
      id,
      data: { layout: translated(written.layout, slug, fixture) },
      locale,
      overrideAccess: true,
      context: { skipRevalidation: true },
    })

  return 'updated'
}

/** A placeholder upload the seeded sections draw, by the filename `seedMedia` gave it. */
async function upload(payload: Payload, filename: string): Promise<number> {
  const media = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
    overrideAccess: true,
  })

  return media.docs[0].id
}

export async function seedPages(payload: Payload): Promise<SeedOutcome[]> {
  // Every page first, then the sections: a section can point at another page (the yachts
  // promotion does), and the page it points at may come later in the list than it does.
  const created = await createPages(payload)
  const pages = await payload.find({
    collection: 'pages',
    limit: 0,
    depth: 0,
    select: { slug: true },
    overrideAccess: true,
  })
  const fixture: Fixture = {
    // The photograph every section shows, and the dark one the privileges panel is patterned with.
    photo: await upload(payload, 'seed-gold.png'),
    surface: await upload(payload, 'seed-surface.png'),
    pages: new Map(pages.docs.map((page) => [page.slug ?? '', page.id])),
  }

  const outcomes: SeedOutcome[] = []
  for (const slug of PAGE_SLUGS) {
    const page = await find(payload, slug)
    if (!page) continue

    // A page that predates a block takes the sections that block's issue adds, which is what
    // keeps the fixture reconciled rather than only idempotent (AGENTS.md §1.5).
    const action = await addSections(payload, page, slug, fixture)

    outcomes.push({
      collection: 'pages',
      key: slug === '' ? '(home)' : slug,
      action: created.has(slug) ? 'created' : action,
      id: page.id,
    })
  }

  return outcomes
}

/** One published page per static route, in every routed locale. Answers which ones it wrote. */
async function createPages(payload: Payload): Promise<Set<string>> {
  const created = new Set<string>()

  for (const slug of PAGE_SLUGS) {
    if (await find(payload, slug)) continue

    const page = await payload.create({
      collection: 'pages',
      data: {
        title: TITLES[slug].en,
        slug,
        layout: [],
        _status: 'published',
        meta: META[slug]?.en,
      },
      locale: 'en',
      overrideAccess: true,
      // A bulk write has nothing to invalidate (docs/conventions/rendering.md).
      context: { skipRevalidation: true },
    })

    // The other routed locales are translations of the same document, not new ones.
    for (const locale of DEFAULT_LOCALES.filter((entry) => entry !== 'en'))
      await payload.update({
        collection: 'pages',
        id: page.id,
        data: { title: TITLES[slug][locale as 'ru'], meta: META[slug]?.[locale] },
        locale,
        overrideAccess: true,
        context: { skipRevalidation: true },
      })

    created.add(slug)
  }

  return created
}

/** The page a route is served from, or nothing when the seed has not written it yet. */
async function find(payload: Payload, slug: string): Promise<Page | undefined> {
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: true,
  })

  return result.docs[0]
}
