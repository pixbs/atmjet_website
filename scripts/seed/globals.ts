import type { Payload } from 'payload'

import { DEFAULT_LOCALE, DEFAULT_LOCALES, type Locale } from '../../src/i18n/locales'
import type { SeedOutcome } from './report'

/**
 * The chrome the legacy site hard-coded (issue #61): the twelve navigation links of
 * `docs/legacy-inventory.md` sections 3.3 and 3.4, in their legacy order and wording, and the
 * footer's legal line.
 *
 * Idempotent like the rest of the seed: a global that already has navigation is left alone, so
 * an editor's changes survive a re-run. `SiteSettings` needs no seed — its legacy values are the
 * field defaults.
 */

/** A string per locale. English is required: it is what a locale without a translation falls back to. */
type Translated = Partial<Record<Locale, string>> & { en: string }

const translate = (value: Translated, locale: Locale): string => value[locale] ?? value.en

/** Legacy `navigation.*`, keyed by the page each link opens. */
const NAV_LABELS: Record<string, Translated> = {
  '': { en: 'Home', ru: 'Главная' },
  partners: { en: 'Partners', ru: 'Партнеры' },
  business_agents: { en: 'Personal assistants', ru: 'Персональным ассистентам' },
  medical_aviation: { en: 'Medical aviation', ru: 'Медицинская авиация' },
  empty_legs: { en: 'Empty legs', ru: 'Empty Leg' },
  cargo_charter: { en: 'Cargo charter', ru: 'Грузовые перевозки' },
  atm_jet_group: { en: 'ATM JET group', ru: 'Группа компаний АТМ JET' },
  aircraft: { en: 'Aircraft', ru: 'Самолеты' },
  group_charters: { en: 'Group charters', ru: 'Для групповых рейсов' },
  sales_dept: { en: 'Aircraft Sales', ru: 'Продажа самолетов' },
  sales_yachts: { en: 'Yachts Sales', ru: 'Продажа яхт' },
  yachts: { en: 'Yachts Charter', ru: 'Аренда яхт' },
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

const BOOKING_LABEL: Translated = { en: 'Make a booking', ru: 'Забронировать' }

const LEGAL: Record<'location' | 'copyright', Translated> = {
  location: { en: 'Dubai +971 (50) 458-99-26', ru: 'Дубай +971 (50) 458-99-26' },
  copyright: {
    en: '©ATM JET, 2004-{year}. All rights reserved',
    ru: '©ATM JET, 2004-{year}. Все права защищены',
  },
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
  const outcomes: SeedOutcome[] = []

  for (const slug of SEEDED_GLOBALS) {
    // A global that has been saved once is an editor's, whatever it holds now: a re-run must not
    // write the legacy menu back over a navigation someone has deliberately emptied.
    const existing = await payload.findGlobal({ slug, depth: 0, overrideAccess: true })
    if (existing.id !== undefined) {
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
    for (const locale of [DEFAULT_LOCALE, ...DEFAULT_LOCALES.filter((l) => l !== DEFAULT_LOCALE)]) {
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
                legal: {
                  location: translate(LEGAL.location, locale),
                  copyright: translate(LEGAL.copyright, locale),
                },
              }
            : {}),
        },
      })
    }

    outcomes.push({ collection: 'globals', key: slug, action: 'created' })
  }

  return outcomes
}
