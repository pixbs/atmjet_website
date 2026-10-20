import type { Payload } from 'payload'

import { ALL_LOCALES } from '../../src/i18n/locales'
import { redirectRulesFrom, type StoredRedirect } from '../../src/lib/data/redirects'
import { findRedirectLoop, shadowedPaths } from '../../src/lib/redirects'
import { writeAircraftRedirects } from '../migrate/redirects'
import { SEED_AIRCRAFT } from './aircraft'
import type { SeedOutcome } from './report'

/**
 * The legacy redirect map (issues #69 and #172).
 *
 * `next.config.mjs` shipped five, all `permanent: true`, all written with the locale as a
 * `:slug` parameter (`docs/legacy-inventory.md` section 1.3). Here the locale is not stored at
 * all — the resolver puts the visitor's own back on. The two rules that carried a dynamic
 * `:id` are not patterns any more: the decision of 2026-09-13 replaces them with one rule per
 * real aircraft (`scripts/migrate/redirects.ts`), so an old URL naming nothing is a 404.
 */
export interface LegacyRedirect {
  from: string
  to: string
  matchSubPaths: boolean
  note: string
}

export const LEGACY_REDIRECTS: readonly LegacyRedirect[] = [
  {
    from: '/jets',
    to: '/',
    matchSubPaths: false,
    note: 'Legacy next.config.mjs: /:locale/jets → /',
  },
  {
    from: '/planes',
    to: '/aircraft',
    matchSubPaths: false,
    note: 'Legacy next.config.mjs: /:locale/planes. Each /planes/:id is a rule of its own (#172).',
  },
  {
    from: '/aircrafts',
    to: '/aircraft',
    matchSubPaths: false,
    note: 'Legacy next.config.mjs: /:locale/aircrafts. Each /aircrafts/:id is a rule of its own (#172).',
  },
]

/**
 * Refuses a map that would strand a visitor or a page (issue #172).
 *
 * A loop reads perfectly well on the row that closes it — `/a → /b` and `/b → /a` are each
 * reasonable — and the visitor is the one who finds out, with `ERR_TOO_MANY_REDIRECTS`. A rule
 * that catches a path a page is served at hides that page just as quietly. Both are checked over
 * everything the collection holds, not only the rows seeded here, because an editor's rule and a
 * seeded one make a loop together just as easily.
 *
 * Every language is checked: a rule may be scoped to one locale, so a map that is sound in
 * English can still loop in Russian.
 */
async function assertSound(payload: Payload): Promise<void> {
  const [stored, pages] = await Promise.all([
    payload.find({
      collection: 'redirects',
      // The target of a rule that points at a page is that page's slug, one level down.
      depth: 1,
      limit: 0,
      pagination: false,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'pages',
      depth: 0,
      limit: 0,
      pagination: false,
      select: { slug: true },
      overrideAccess: true,
    }),
  ])

  const rules = redirectRulesFrom(stored.docs as StoredRedirect[])
  const slugs = pages.docs
    .map((page) => page.slug)
    .filter((slug): slug is string => typeof slug === 'string')

  for (const locale of ALL_LOCALES) {
    const loop = findRedirectLoop(rules, locale)
    if (loop) {
      throw new Error(`seed: the redirects loop in ${locale}: ${loop.join(' -> ')}`)
    }

    const shadowed = shadowedPaths(rules, slugs, locale)
    if (shadowed.length > 0) {
      throw new Error(
        `seed: these pages are unreachable in ${locale}, a redirect answers for them first: ${shadowed.join(', ')}`,
      )
    }
  }
}

export async function seedRedirects(payload: Payload): Promise<SeedOutcome[]> {
  const outcomes: SeedOutcome[] = []

  for (const redirect of LEGACY_REDIRECTS) {
    const existing = await payload.find({
      collection: 'redirects',
      where: { from: { equals: redirect.from } },
      limit: 1,
      overrideAccess: true,
    })

    const rule = existing.docs[0]

    if (rule !== undefined) {
      // Reconciled, not only idempotent: a database seeded while these were patterns loses them.
      const current = rule.matchSubPaths === redirect.matchSubPaths && rule.to?.url === redirect.to

      if (!current)
        await payload.update({
          collection: 'redirects',
          id: rule.id,
          data: {
            to: { type: 'custom', url: redirect.to },
            matchSubPaths: redirect.matchSubPaths,
            note: redirect.note,
          },
          overrideAccess: true,
          context: { skipRevalidation: true },
        })

      outcomes.push({
        collection: 'redirects',
        key: redirect.from,
        action: current ? 'unchanged' : 'updated',
        id: rule.id,
      })
      continue
    }

    const created = await payload.create({
      collection: 'redirects',
      data: {
        from: redirect.from,
        to: { type: 'custom', url: redirect.to },
        type: '308',
        matchSubPaths: redirect.matchSubPaths,
        note: redirect.note,
      },
      overrideAccess: true,
      // A bulk write has nothing to invalidate (docs/conventions/rendering.md).
      context: { skipRevalidation: true },
    })

    outcomes.push({
      collection: 'redirects',
      key: redirect.from,
      action: 'created',
      id: created.id,
    })
  }

  // The aircraft are seeded before the redirects, so each one has its old addresses.
  // Only the seeded aircraft's: the integration tier writes aircraft of its own beside them.
  const seeded = { registrationDisplay: { in: SEED_AIRCRAFT.map((one) => one.registration) } }
  for (const { from, action, id } of await writeAircraftRedirects(payload, seeded))
    outcomes.push({ collection: 'redirects', key: from, action, id })

  // The pages are seeded before the redirects, so this sees the whole map against the whole site.
  await assertSound(payload)

  return outcomes
}
