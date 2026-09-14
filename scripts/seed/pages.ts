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

/** The sections a seeded page starts with; a page with no entry here starts with none. */
function layoutFor(slug: string, locale: 'en' | 'ru', image: number) {
  const description = HERO_PAGES[slug]?.[locale]
  if (description === undefined) return []

  return [{ blockType: 'heroSubpage' as const, title: TITLES[slug][locale], description, image }]
}

type Layout = NonNullable<Page['layout']>

/** The same sections in another language, keeping the ids the English write gave the blocks. */
function translated(layout: Layout | null | undefined, slug: string, locale: 'ru'): Layout {
  return (layout ?? []).map((block) => ({
    ...block,
    title: TITLES[slug][locale],
    description: HERO_PAGES[slug]?.[locale] ?? '',
    // The create answered at its own depth, where an upload is the document rather than its id.
    image: typeof block.image === 'object' ? block.image.id : block.image,
  }))
}

/**
 * Gives a page that predates a block the sections that block's issue seeds. A database seeded
 * before E7 started would otherwise keep an empty layout for good.
 */
async function addSections(
  payload: Payload,
  id: number,
  slug: string,
  image: number,
): Promise<'updated' | 'unchanged'> {
  const layout = layoutFor(slug, 'en', image)
  if (layout.length === 0) return 'unchanged'

  const page = await payload.update({
    collection: 'pages',
    id,
    data: { layout },
    locale: 'en',
    overrideAccess: true,
    context: { skipRevalidation: true },
  })

  for (const locale of DEFAULT_LOCALES.filter((entry) => entry !== 'en'))
    await payload.update({
      collection: 'pages',
      id,
      data: { layout: translated(page.layout, slug, locale as 'ru') },
      locale,
      overrideAccess: true,
      context: { skipRevalidation: true },
    })

  return 'updated'
}

/** The placeholder upload the seeded sections draw, by the filename `seedMedia` gave it. */
async function heroImage(payload: Payload): Promise<number> {
  const media = await payload.find({
    collection: 'media',
    where: { filename: { equals: 'seed-gold.png' } },
    limit: 1,
    overrideAccess: true,
  })

  return media.docs[0].id
}

export async function seedPages(payload: Payload): Promise<SeedOutcome[]> {
  const outcomes: SeedOutcome[] = []
  const image = await heroImage(payload)

  for (const slug of PAGE_SLUGS) {
    const key = slug === '' ? '(home)' : slug
    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      limit: 1,
      overrideAccess: true,
    })

    if (existing.totalDocs > 0) {
      const page = existing.docs[0]
      // A database seeded before a block existed takes the sections that block's issue adds,
      // which is what keeps the fixture reconciled rather than only idempotent (AGENTS.md §1.5).
      const action =
        (page.layout ?? []).length === 0
          ? await addSections(payload, page.id, slug, image)
          : 'unchanged'

      outcomes.push({ collection: 'pages', key, action, id: page.id })
      continue
    }

    const created = await payload.create({
      collection: 'pages',
      data: {
        title: TITLES[slug].en,
        slug,
        layout: layoutFor(slug, 'en', image),
        _status: 'published',
        meta: META[slug]?.en,
      },
      locale: 'en',
      overrideAccess: true,
      // A bulk write has nothing to invalidate (docs/conventions/rendering.md).
      context: { skipRevalidation: true },
    })

    // The other routed locales are translations of the same document, not new ones.
    for (const locale of DEFAULT_LOCALES.filter((entry) => entry !== 'en')) {
      await payload.update({
        collection: 'pages',
        id: created.id,
        data: {
          title: TITLES[slug][locale as 'ru'],
          meta: META[slug]?.[locale],
          // The blocks keep the ids the English write gave them, so this translates the
          // sections rather than adding a second set.
          layout: translated(created.layout, slug, locale as 'ru'),
        },
        locale,
        overrideAccess: true,
        context: { skipRevalidation: true },
      })
    }

    outcomes.push({ collection: 'pages', key, action: 'created', id: created.id })
  }

  return outcomes
}
