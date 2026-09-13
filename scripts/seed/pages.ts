import type { Payload } from 'payload'

import { PAGE_SLUGS } from '../../src/collections/Pages'
import { ROUTED_LOCALES } from '../../src/i18n/locales'
import type { SeedOutcome } from './report'

/**
 * One published page per static route (issue #60, E2.5). The legacy yachts page crashed on
 * empty data, so every environment starts with something to render rather than nothing.
 *
 * Layouts stay empty: the sections land in E7 and each block's own issue seeds its content.
 * Titles are placeholders an editor replaces; the English ones read as the legacy navigation
 * labels so the seeded site is recognisable.
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

export async function seedPages(payload: Payload): Promise<SeedOutcome[]> {
  const outcomes: SeedOutcome[] = []

  for (const slug of PAGE_SLUGS) {
    const key = slug === '' ? '(home)' : slug
    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      limit: 1,
      overrideAccess: true,
    })

    if (existing.totalDocs > 0) {
      outcomes.push({ collection: 'pages', key, action: 'unchanged', id: existing.docs[0].id })
      continue
    }

    const created = await payload.create({
      collection: 'pages',
      data: { title: TITLES[slug].en, slug, layout: [], _status: 'published' },
      locale: 'en',
      overrideAccess: true,
      // A bulk write has nothing to invalidate (docs/conventions/rendering.md).
      context: { skipRevalidation: true },
    })

    // The other routed locales are translations of the same document, not new ones.
    for (const locale of ROUTED_LOCALES.filter((entry) => entry !== 'en')) {
      await payload.update({
        collection: 'pages',
        id: created.id,
        data: { title: TITLES[slug][locale as 'ru'] },
        locale,
        overrideAccess: true,
        context: { skipRevalidation: true },
      })
    }

    outcomes.push({ collection: 'pages', key, action: 'created', id: created.id })
  }

  return outcomes
}
