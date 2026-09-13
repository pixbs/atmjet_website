import { revalidateTag } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionSlug } from 'payload'

/**
 * Drops the cached pages that read a collection after a write (ADR-0007). Importers pass
 * `context.skipRevalidation` so a bulk run does not invalidate once per row; a write outside a
 * Next request scope (the seed, `payload run`) has no cache to drop, which Next reports as an
 * invariant rather than a typed error.
 */
export function revalidateCollection(collection: CollectionSlug): {
  afterChange: CollectionAfterChangeHook
  afterDelete: CollectionAfterDeleteHook
} {
  const drop = (context: { skipRevalidation?: boolean } | undefined): void => {
    if (context?.skipRevalidation) return

    try {
      revalidateTag(collection, 'max')
    } catch (error) {
      const outsideRequest =
        error instanceof Error && /static generation store missing/i.test(error.message)
      if (!outsideRequest) throw error
    }
  }

  return {
    afterChange: ({ doc, context }) => {
      drop(context)
      return doc
    },
    afterDelete: ({ doc, context }) => {
      drop(context)
      return doc
    },
  }
}
