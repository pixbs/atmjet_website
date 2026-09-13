import { revalidateTag } from 'next/cache'
import type { CollectionSlug } from 'payload'

import { revalidationHooks, type RevalidationHooks } from './revalidate'

/**
 * How long a stale page may still be served after an editor saves. `'max'` is the profile Next
 * recommends: the next request triggers the revalidation and is answered from the stale copy
 * while it runs, so an editor's save never turns into a blocking cache miss for a visitor.
 * The single-argument form of `revalidateTag` is deprecated in Next 16
 * (node_modules/next/dist/docs/01-app/03-api-reference/04-functions/revalidateTag.md).
 */
const REVALIDATE_PROFILE = 'max'

/**
 * Whether Next refused because there is no request scope to revalidate in. It signals that with
 * an invariant rather than a typed error, so the message is all there is to match on.
 */
function isMissingRequestScope(error: unknown): boolean {
  return error instanceof Error && /static generation store missing/i.test(error.message)
}

/**
 * Not every write comes from a rendering server: the seed script and the E5 importers run
 * through `payload run`, and a job could too. Those have no Next cache to invalidate.
 *
 * The whole write is abandoned as soon as Next says there is no request scope, because the
 * remaining tags would fail the same way and building a stack trace per tag is expensive on an
 * import that writes thousands of rows. Any other failure is rethrown, so a real one stays
 * visible.
 */
function revalidateWherePossible(tags: readonly string[]): void {
  for (const tag of tags) {
    try {
      revalidateTag(tag, REVALIDATE_PROFILE)
    } catch (error) {
      if (!isMissingRequestScope(error)) throw error
      return
    }
  }
}

/**
 * The collection hooks bound to Next's cache. Kept apart from `revalidate.ts` so the tag logic
 * can be unit-tested without a Next request scope.
 */
export function nextRevalidationHooks(collection: CollectionSlug): RevalidationHooks {
  return revalidationHooks(collection, revalidateWherePossible)
}
