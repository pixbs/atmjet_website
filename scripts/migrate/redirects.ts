import type { Payload, Where } from 'payload'

import type { Aircraft } from '../../src/payload-types'
import { aircraftSlug } from '../../src/lib/aircraft'

/**
 * The redirects the legacy `/:locale/planes/:id` and `/:locale/aircrafts/:id` rules become
 * (issue #172, decision of 2026-09-13): one per real aircraft rather than a pattern, so an old
 * URL naming an aircraft lands on its page and one naming nothing is the 404 it always was.
 *
 * `:id` was whatever the legacy detail route resolved: the catalogue slug, or the tail number
 * the old sitemap listed. Both are kept in each document's provenance by the imports of E5.6
 * and E5.7, and the slug the aircraft is served at now is added, so a link written against
 * the new site's own address under the old prefix resolves too.
 */
const LEGACY_PREFIXES = ['/planes', '/aircrafts'] as const

export interface AircraftRedirect {
  from: string
  to: string
}

export function aircraftRedirects(
  aircraft: Pick<Aircraft, 'slug' | 'registrationDisplay' | 'provenance'>,
): AircraftRedirect[] {
  const slug = aircraftSlug(aircraft)
  const names = [aircraft.provenance?.legacySlug, aircraft.provenance?.legacyTailNumber, slug]
    .map((name) => (name ?? '').trim())
    .filter((name) => name !== '' && !name.includes('/'))

  return [...new Set(names)].flatMap((name) =>
    LEGACY_PREFIXES.map((prefix) => ({ from: `${prefix}/${name}`, to: `/aircraft/${slug}` })),
  )
}

export interface RedirectOutcome {
  from: string
  action: 'created' | 'updated' | 'unchanged'
  id: number | string
}

/** Rows per lookup: `from` is indexed, and a list this long keeps the statement small. */
const LOOKUP = 200

/**
 * Writes the redirect of every aircraft, idempotently by `from`: a rule already there with the
 * same target is left alone, one with another target is corrected, and nothing is deleted.
 */
export async function writeAircraftRedirects(
  payload: Payload,
  /** Which aircraft: every one by default; the seed passes its own. */
  where?: Where,
): Promise<RedirectOutcome[]> {
  const outcomes: RedirectOutcome[] = []
  const { docs } = await payload.find({
    collection: 'aircraft',
    where,
    select: { slug: true, registrationDisplay: true, provenance: true },
    pagination: false,
    depth: 0,
    overrideAccess: true,
  })
  const wanted = new Map(docs.flatMap(aircraftRedirects).map((rule) => [rule.from, rule.to]))
  const froms = [...wanted.keys()]

  for (let start = 0; start < froms.length; start += LOOKUP) {
    const batch = froms.slice(start, start + LOOKUP)
    const { docs: existing } = await payload.find({
      collection: 'redirects',
      where: { from: { in: batch } },
      pagination: false,
      depth: 0,
      overrideAccess: true,
    })
    const found = new Map(existing.map((rule) => [rule.from, rule]))

    for (const from of batch) {
      const to = wanted.get(from) as string
      const rule = found.get(from)
      const data = {
        from,
        to: { type: 'custom' as const, url: to },
        type: '308' as const,
        matchSubPaths: false,
        note: 'Legacy /planes/:id and /aircrafts/:id, one per aircraft (issue #172).',
      }

      if (rule === undefined) {
        const created = await payload.create({
          collection: 'redirects',
          data,
          overrideAccess: true,
          context: { skipRevalidation: true },
        })
        outcomes.push({ from, action: 'created', id: created.id })
      } else if (rule.to?.url !== to || rule.matchSubPaths) {
        await payload.update({
          collection: 'redirects',
          id: rule.id,
          data,
          overrideAccess: true,
          context: { skipRevalidation: true },
        })
        outcomes.push({ from, action: 'updated', id: rule.id })
      } else {
        outcomes.push({ from, action: 'unchanged', id: rule.id })
      }
    }
  }

  return outcomes
}
