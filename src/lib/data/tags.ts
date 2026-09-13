import type { CollectionSlug } from 'payload'

import type { Locale } from '@/i18n/locales'

/**
 * Cache tag vocabulary (ADR-0007). Every server read tags its result and every write
 * invalidates the same tag, so the two can only match if they are built here.
 *
 * Three shapes, narrowest first:
 *   `media:doc:12:en`   one document in one locale
 *   `media:list:en`     every listing of a collection in one locale
 *   `media`             the whole collection, every locale
 *
 * Locale is part of the tag because a localised write changes one locale's HTML and leaves the
 * others valid; invalidating all of them would throw away work for no reason.
 */
function collectionTag(collection: CollectionSlug): string {
  return collection
}

function listTag(collection: CollectionSlug, locale: Locale): string {
  return `${collection}:list:${locale}`
}

function documentTag(collection: CollectionSlug, id: number | string, locale: Locale): string {
  return `${collection}:doc:${id}:${locale}`
}

/**
 * What a write to one document invalidates: the document in that locale, the listings that
 * include it, and the collection-wide tag. A write with no locale (or one made through
 * `locale: 'all'`) invalidates every locale, because any of them may have changed.
 */
export function tagsForWrite(
  collection: CollectionSlug,
  id: number | string,
  locale: Locale | undefined,
  locales: readonly Locale[],
): string[] {
  const affected = locale ? [locale] : locales

  return [
    collectionTag(collection),
    ...affected.map((entry) => listTag(collection, entry)),
    ...affected.map((entry) => documentTag(collection, id, entry)),
  ]
}
