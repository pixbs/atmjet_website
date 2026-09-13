import type { Payload } from 'payload'

import { pathForPage } from '@/collections/Pages'
import type { Locale } from '@/i18n/locales'
import {
  bySpecificity,
  matchRedirect,
  type RedirectMatch,
  type RedirectRule,
} from '@/lib/redirects'
import { getPayloadClient } from './payload'

/**
 * Reading the redirect map (issue #69).
 *
 * The rules live in Payload rather than in `next.config.mjs`, so they can be edited without a
 * deploy — the point of E4.10. They are read on a request that would otherwise be a 404, which
 * keeps the cost off every other request, and the result is tagged `redirects` so a write
 * through the collection's `afterChange` hook drops it.
 */

/** The shape of a stored redirect, as much of it as matching needs. */
interface StoredRedirect {
  from?: unknown
  matchSubPaths?: boolean | null
  locale?: string | null
  type?: string | null
  to?: {
    type?: string | null
    url?: unknown
    reference?: unknown
  } | null
}

/** The target of a stored rule: a path the resolver will localise, or nothing usable. */
function targetOf(redirect: StoredRedirect): string | undefined {
  const to = redirect.to
  if (!to) return undefined

  if (to.type === 'custom') return typeof to.url === 'string' && to.url !== '' ? to.url : undefined

  const reference = to.reference as { value?: { slug?: unknown } } | null | undefined
  const slug = reference?.value?.slug

  // A page reference is stored with its slug; the locale is added by the matcher, so the path is
  // built without one here.
  return typeof slug === 'string' ? pathForPage('', slug).replace(/^\/+/, '/') : undefined
}

/** Every usable rule, most specific first, in the shape `matchRedirect` takes. */
function rulesFrom(documents: readonly StoredRedirect[]): RedirectRule[] {
  const rules: RedirectRule[] = []

  for (const document of documents) {
    const to = targetOf(document)
    if (typeof document.from !== 'string' || to === undefined) continue

    rules.push({
      from: document.from,
      to,
      matchSubPaths: document.matchSubPaths,
      locale: document.locale,
      type: document.type,
    })
  }

  return rules.sort(bySpecificity)
}

/**
 * Where a request should go, if anywhere. `pathname` carries no locale: the caller has already
 * stripped it, because that is the segment the route matched on.
 */
export async function findRedirect(
  locale: Locale,
  pathname: string,
  client: () => Promise<Payload> = getPayloadClient,
): Promise<RedirectMatch | undefined> {
  try {
    const payload = await client()
    const result = await payload.find({
      collection: 'redirects',
      depth: 1,
      limit: 0,
      pagination: false,
      overrideAccess: false,
    })

    return matchRedirect(rulesFrom(result.docs as StoredRedirect[]), pathname, locale)
  } catch (error) {
    // A 404 that cannot reach the database is still a 404, and a redirect lookup is not worth
    // turning it into a 500. The same reasoning as `listPageParams` at build time.
    console.warn('[redirects] lookup skipped: the content database was unreachable.', error)
    return undefined
  }
}
