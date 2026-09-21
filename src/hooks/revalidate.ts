import { revalidatePath, revalidateTag } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionSlug,
  GlobalAfterChangeHook,
  GlobalSlug,
} from 'payload'

/**
 * Drops the cached pages that read a collection or a global after a write (ADR-0007). Importers
 * pass `context.skipRevalidation` so a bulk run does not invalidate once per row; a write outside
 * a Next request scope (the seed, `payload run`) has no cache to drop, which Next reports as an
 * invariant rather than a typed error.
 */
function drop(tag: string, context: { skipRevalidation?: boolean } | undefined): void {
  if (context?.skipRevalidation) return

  try {
    revalidateTag(tag, 'max')
    /*
     * The tag alone reaches nothing a visitor is served (issue #178). A page reads Payload
     * through the Local API rather than through a cached function, so the rendered entry carries
     * only the path tags Next writes itself — `x-next-cache-tags` on any `.meta` under
     * `.next/server/app` — and an editor's published change never appeared on the site. The
     * whole tree under the root layout goes instead, which is what Next offers a reader that has
     * not opted into `use cache`; the tag stays for the first reader that does.
     *
     * The bluntness is affordable: only the editorial collections install these hooks, a bulk
     * import opts out above, and `max` serves the stale page while the new one renders, so a
     * save costs a re-render rather than a visitor's wait.
     */
    revalidatePath('/', 'layout')
  } catch (error) {
    const outsideRequest =
      error instanceof Error && /static generation store missing/i.test(error.message)
    if (!outsideRequest) throw error
  }
}

export function revalidateCollection(collection: CollectionSlug): {
  afterChange: CollectionAfterChangeHook
  afterDelete: CollectionAfterDeleteHook
} {
  return {
    afterChange: ({ doc, context }) => {
      drop(collection, context)
      return doc
    },
    afterDelete: ({ doc, context }) => {
      drop(collection, context)
      return doc
    },
  }
}

/**
 * A global has no delete: it is one document that always exists once it has been saved, so a
 * change is the only thing a reader has to be told about.
 */
export function revalidateGlobal(global: GlobalSlug): { afterChange: GlobalAfterChangeHook } {
  return {
    afterChange: ({ doc, context }) => {
      drop(global, context)
      return doc
    },
  }
}
