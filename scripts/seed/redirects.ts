import type { Payload } from 'payload'

import type { SeedOutcome } from './report'

/**
 * The legacy redirect map (issue #69, E2.5).
 *
 * `next.config.mjs` shipped exactly these five, all `permanent: true`, all written with the
 * locale as a `:slug` parameter (`docs/legacy-inventory.md` section 1.3). Here the locale is not
 * stored at all — the resolver puts the visitor's own back on — and the two rules that carried a
 * dynamic segment become `matchSubPaths`.
 *
 * This is the legacy map, not the final list: E11.3 decides what the site ships with, and the
 * sitemap URLs of section 2.3 are its other input.
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
    matchSubPaths: true,
    note: 'Legacy next.config.mjs: /:locale/planes and /:locale/planes/:id',
  },
  {
    from: '/aircrafts',
    to: '/aircraft',
    matchSubPaths: true,
    note: 'Legacy next.config.mjs: /:locale/aircrafts and /:locale/aircrafts/:id',
  },
]

export async function seedRedirects(payload: Payload): Promise<SeedOutcome[]> {
  const outcomes: SeedOutcome[] = []

  for (const redirect of LEGACY_REDIRECTS) {
    const existing = await payload.find({
      collection: 'redirects',
      where: { from: { equals: redirect.from } },
      limit: 1,
      overrideAccess: true,
    })

    if (existing.totalDocs > 0) {
      outcomes.push({
        collection: 'redirects',
        key: redirect.from,
        action: 'unchanged',
        id: existing.docs[0].id,
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

  return outcomes
}
