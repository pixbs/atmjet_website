import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionSlug } from 'payload'

import { ALL_LOCALES, type Locale } from '@/i18n/locales'

import { tagsForWrite } from './tags'

/**
 * Cache invalidation for a collection that feeds a page (ADR-0007: revalidation is part of
 * every such collection).
 *
 * The revalidator is injected rather than imported so the hooks can be tested without a Next
 * request scope; `src/lib/data/revalidate-next.ts` binds the real `revalidateTag`.
 *
 * It takes every tag of one write at once. A write outside a Next request scope cannot
 * revalidate any of them, so the binding learns that from the first tag instead of failing
 * once per tag.
 */
export type Revalidator = (tags: readonly string[]) => void

/** Narrows whatever Payload puts on `req.locale` to a locale we know, or undefined for all. */
export function localeOf(value: unknown): Locale | undefined {
  return typeof value === 'string' && (ALL_LOCALES as readonly string[]).includes(value)
    ? (value as Locale)
    : undefined
}

export interface RevalidationHooks {
  afterChange: CollectionAfterChangeHook
  afterDelete: CollectionAfterDeleteHook
}

/**
 * Builds the `afterChange` and `afterDelete` hooks for one collection. A write during an import
 * passes `context.skipRevalidation` so a bulk migration does not invalidate once per row
 * (ADR-0002 section 6 runs the importers with hooks skipped through `context`).
 */
export function revalidationHooks(
  collection: CollectionSlug,
  revalidate: Revalidator,
): RevalidationHooks {
  const run = (id: number | string, rawLocale: unknown, context: unknown): void => {
    if ((context as { skipRevalidation?: boolean } | undefined)?.skipRevalidation) return

    revalidate(tagsForWrite(collection, id, localeOf(rawLocale), ALL_LOCALES))
  }

  return {
    afterChange: ({ doc, req, context }) => {
      run(doc.id, req?.locale, context)
      return doc
    },
    afterDelete: ({ doc, id, req, context }) => {
      run(id ?? doc?.id, req?.locale, context)
      return doc
    },
  }
}
