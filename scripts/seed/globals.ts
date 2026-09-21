import type { Payload } from 'payload'

import { ALL_LOCALES, DEFAULT_LOCALE, type Locale } from '../../src/i18n/locales'
import type { SeedOutcome } from './report'

/**
 * The chrome the legacy site hard-coded (issue #61): the twelve navigation links of
 * `docs/legacy-inventory.md` sections 3.3 and 3.4, in their legacy order and wording, and the
 * footer's legal line.
 *
 * Idempotent like the rest of the seed: a global that already has navigation is left alone, so
 * an editor's changes survive a re-run. `SiteSettings` needs no seed — its legacy values are the
 * field defaults.
 *
 * The one thing a re-run does rewrite is a menu that has lost every page it pointed at
 * (issue #260), which is what the integration tier leaves behind when it deletes the pages the
 * seed created.
 */

/** A string per locale. English is required: it is what a locale without a translation falls back to. */
type Translated = Partial<Record<Locale, string>> & { en: string }

const translate = (value: Translated, locale: Locale): string => value[locale] ?? value.en

/** Legacy `navigation.*`, keyed by the page each link opens. */
const NAV_LABELS: Record<string, Translated> = {
  '': { en: 'Home', ru: 'Главная', uk: 'Головна' },
  partners: { en: 'Partners', ru: 'Партнеры', uk: 'Партнери' },
  business_agents: {
    en: 'Personal assistants',
    ru: 'Персональным ассистентам',
    uk: 'Персональним асистентам',
  },
  medical_aviation: { en: 'Medical aviation', ru: 'Медицинская авиация', uk: 'Медична авіація' },
  empty_legs: { en: 'Empty legs', ru: 'Empty Leg', uk: 'Empty Leg' },
  cargo_charter: { en: 'Cargo charter', ru: 'Грузовые перевозки', uk: 'Вантажні перевезення' },
  atm_jet_group: {
    en: 'ATM JET group',
    ru: 'Группа компаний АТМ JET',
    uk: 'Група компаній АТМ JET',
  },
  aircraft: { en: 'Aircraft', ru: 'Самолеты', uk: 'Літаки' },
  group_charters: { en: 'Group charters', ru: 'Для групповых рейсов', uk: 'Для групових рейсів' },
  sales_dept: { en: 'Aircraft Sales', ru: 'Продажа самолетов', uk: 'Продажі літаків' },
  sales_yachts: { en: 'Yachts Sales', ru: 'Продажа яхт' },
  yachts: { en: 'Yachts Charter', ru: 'Аренда яхт', uk: 'Яхти' },
}

/** The services column of the open menu, and the first footer row. */
const SERVICES = [
  '',
  'partners',
  'business_agents',
  'medical_aviation',
  'empty_legs',
  'cargo_charter',
]

/** The company column of the open menu. */
const COMPANY = [
  'atm_jet_group',
  'aircraft',
  'group_charters',
  'sales_dept',
  'sales_yachts',
  'yachts',
]

/** The second footer row: the same six pages, in the order the footer listed them. */
const FOOTER_SECOND_ROW = [
  'sales_dept',
  'sales_yachts',
  'group_charters',
  'atm_jet_group',
  'aircraft',
  'yachts',
]

/** The globals this seed fills in. `site-settings` needs none: its legacy values are defaults. */
export const SEEDED_GLOBALS = ['header', 'footer'] as const

const BOOKING_LABEL: Translated = { en: 'Make a booking', ru: 'Забронировать', uk: 'Забронювати' }

const LEGAL: Record<'location' | 'copyright', Translated> = {
  location: {
    en: 'Dubai +971 (50) 458-99-26',
    ru: 'Дубай +971 (50) 458-99-26',
    uk: 'Дубай +971 (50) 458-99-26',
  },
  copyright: {
    en: '©ATM JET, 2004-{year}. All rights reserved',
    ru: '©ATM JET, 2004-{year}. Все права защищены',
    uk: '©ATM JET, 2004-{year}. Усі права захищені',
  },
}

/** A saved navigation row: with `depth: 0` the page is its id, or nothing once it is deleted. */
interface SavedRow {
  label?: string | null
  page?: number | string | { id: number | string } | null
}

interface SavedMenus {
  primaryNav?: SavedRow[] | null
  secondaryNav?: SavedRow[] | null
}

/** The labels this seed writes into one menu, in the language a global is read in by default. */
const seededLabels = (slugs: string[]): string[] =>
  slugs.map((slug) => translate(NAV_LABELS[slug], DEFAULT_LOCALE))

const sameLabels = (rows: SavedRow[], slugs: string[]): boolean => {
  const labels = seededLabels(slugs)

  return rows.length === labels.length && rows.every((row, index) => row.label === labels[index])
}

/**
 * Whether a saved global is this seed's own menu with every page gone (issue #260), which is
 * what the integration tier leaves behind when it deletes the pages the seed created: deleting a
 * page clears the links to it, the relationship being optional so that a delete cannot fail on a
 * not-null column.
 *
 * Both halves are needed. An editor's menu is left alone because it still opens something, or
 * because it is empty, or because its wording is theirs rather than the wording below — and a
 * suite that has written its own rows over the global owns them for as long as it holds them.
 */
function isTheSeedsOwnWreck(global: SavedMenus, slug: (typeof SEEDED_GLOBALS)[number]) {
  const rows = [...(global.primaryNav ?? []), ...(global.secondaryNav ?? [])]
  if (rows.length === 0) return false
  if (!rows.every((row) => row.page === null || row.page === undefined)) return false

  return (
    sameLabels(global.primaryNav ?? [], SERVICES) &&
    sameLabels(global.secondaryNav ?? [], slug === 'footer' ? FOOTER_SECOND_ROW : COMPANY)
  )
}

/** The placeholder the footer's photograph is until the real assets arrive (issue #84). */
async function backgroundId(payload: Payload): Promise<number | undefined> {
  const media = await payload.find({
    collection: 'media',
    where: { filename: { equals: 'seed-surface.png' } },
    limit: 1,
    overrideAccess: true,
  })

  return media.docs[0]?.id
}

async function pageIdsBySlug(payload: Payload): Promise<Map<string, number>> {
  const pages = await payload.find({
    collection: 'pages',
    limit: 0,
    depth: 0,
    select: { slug: true },
    overrideAccess: true,
  })

  return new Map(pages.docs.map((page) => [page.slug ?? '', page.id]))
}

interface NavRow {
  id?: string | null
  label: string
  page: number
}

/**
 * The rows of one navigation list. `written` carries the ids the first locale produced: a
 * localized array keeps its labels per row, so a later locale has to attach itself to the same
 * rows rather than replacing them and taking the earlier labels with it.
 */
function navRows(
  slugs: string[],
  ids: Map<string, number>,
  locale: Locale,
  written?: Array<{ id?: string | null }>,
): NavRow[] {
  return slugs.map((slug, index) => ({
    ...(written?.[index]?.id ? { id: written[index].id } : {}),
    label: translate(NAV_LABELS[slug], locale),
    page: ids.get(slug)!,
  }))
}

export async function seedGlobals(payload: Payload): Promise<SeedOutcome[]> {
  const ids = await pageIdsBySlug(payload)
  const background = await backgroundId(payload)
  const outcomes: SeedOutcome[] = []

  for (const slug of SEEDED_GLOBALS) {
    // A global that has been saved once is an editor's, whatever it holds now: a re-run must not
    // write the legacy menu back over a navigation someone has deliberately emptied. The one
    // exception is this seed's own menu with every page deleted out from under it, which is
    // nobody's work (issue #260); the whole global is written again there, the wording of its
    // button included, because that state is the seed's pages going missing rather than an edit.
    const existing = await payload.findGlobal({ slug, depth: 0, overrideAccess: true })
    const lost = isTheSeedsOwnWreck(existing, slug)
    if (existing.id !== undefined && !lost) {
      outcomes.push({ collection: 'globals', key: slug, action: 'unchanged' })
      continue
    }

    const primary = SERVICES.filter((page) => ids.has(page))
    const secondary = (slug === 'footer' ? FOOTER_SECOND_ROW : COMPANY).filter((page) =>
      ids.has(page),
    )
    type WrittenRows = Array<{ id?: string | null }> | null | undefined
    let written: { primaryNav?: WrittenRows; secondaryNav?: WrittenRows } | undefined

    // English first, then the translations onto the rows it created.
    for (const locale of [DEFAULT_LOCALE, ...ALL_LOCALES.filter((l) => l !== DEFAULT_LOCALE)]) {
      written = await payload.updateGlobal({
        slug,
        locale,
        overrideAccess: true,
        // A bulk write has nothing to invalidate (docs/conventions/rendering.md).
        context: { skipRevalidation: true },
        data: {
          primaryNav: navRows(primary, ids, locale, written?.primaryNav ?? undefined),
          secondaryNav: navRows(secondary, ids, locale, written?.secondaryNav ?? undefined),
          cta: {
            label: translate(BOOKING_LABEL, locale),
            source: slug === 'footer' ? 'Footer' : 'Header',
          },
          ...(slug === 'footer'
            ? {
                background,
                legal: {
                  location: translate(LEGAL.location, locale),
                  copyright: translate(LEGAL.copyright, locale),
                },
              }
            : {}),
        },
      })
    }

    outcomes.push({ collection: 'globals', key: slug, action: lost ? 'updated' : 'created' })
  }

  return outcomes
}
