import { describe, expect, it, vi } from 'vitest'

import { ALL_LOCALES } from '@/i18n/locales'
import {
  collectionTag,
  documentTag,
  isMissingRequestScope,
  listTag,
  localeOf,
  revalidationHooks,
  tagsForWrite,
} from '@/lib/data'

/**
 * Cache tags and the collection hooks that invalidate them (issue #59, ADR-0007). The Next
 * binding lives in revalidate-next.ts; here the revalidator is a spy, so the rules can be
 * checked without a request scope.
 */
describe('cache tags', () => {
  it('names the three scopes distinctly', () => {
    expect(collectionTag('media')).toBe('media')
    expect(listTag('media', 'en')).toBe('media:list:en')
    expect(documentTag('media', 12, 'en')).toBe('media:doc:12:en')
  })

  it('keeps locales apart, so one translation does not drop the others', () => {
    expect(listTag('media', 'ru')).not.toBe(listTag('media', 'en'))
    expect(documentTag('media', 12, 'ru')).not.toBe(documentTag('media', 12, 'en'))
  })

  it('invalidates the document, its listings and the collection for a localised write', () => {
    expect(tagsForWrite('media', 7, 'ru', ALL_LOCALES)).toEqual([
      'media',
      'media:list:ru',
      'media:doc:7:ru',
    ])
  })

  it('invalidates every locale when the write names none', () => {
    expect(tagsForWrite('media', 7, undefined, ALL_LOCALES)).toEqual([
      'media',
      'media:list:en',
      'media:list:ru',
      'media:list:uk',
      'media:doc:7:en',
      'media:doc:7:ru',
      'media:doc:7:uk',
    ])
  })
})

describe('localeOf', () => {
  it('accepts a known locale and rejects anything else', () => {
    expect(localeOf('ru')).toBe('ru')
    expect(localeOf('all')).toBeUndefined()
    expect(localeOf('de')).toBeUndefined()
    expect(localeOf(undefined)).toBeUndefined()
    expect(localeOf(42)).toBeUndefined()
  })
})

describe('revalidationHooks', () => {
  const doc = { id: 7 } as never

  it('invalidates the written locale after a change', () => {
    const revalidate = vi.fn()
    const { afterChange } = revalidationHooks('media', revalidate)

    afterChange({ doc, req: { locale: 'ru' }, context: {} } as never)

    expect(revalidate).toHaveBeenCalledExactlyOnceWith(['media', 'media:list:ru', 'media:doc:7:ru'])
  })

  it('invalidates after a delete as well', () => {
    const revalidate = vi.fn()
    const { afterDelete } = revalidationHooks('media', revalidate)

    afterDelete({ doc, id: 7, req: { locale: 'en' }, context: {} } as never)

    expect(revalidate.mock.calls[0][0]).toContain('media:doc:7:en')
  })

  it('returns the document unchanged, so it stays a pass-through hook', () => {
    const revalidate = vi.fn()
    const { afterChange } = revalidationHooks('media', revalidate)

    expect(afterChange({ doc, req: { locale: 'en' }, context: {} } as never)).toBe(doc)
  })

  it('stays quiet for an import, which writes thousands of rows', () => {
    const revalidate = vi.fn()
    const { afterChange, afterDelete } = revalidationHooks('media', revalidate)

    afterChange({ doc, req: { locale: 'en' }, context: { skipRevalidation: true } } as never)
    afterDelete({ doc, id: 7, req: { locale: 'en' }, context: { skipRevalidation: true } } as never)

    expect(revalidate).not.toHaveBeenCalled()
  })

  it('invalidates every locale when the request carries none', () => {
    const revalidate = vi.fn()
    const { afterChange } = revalidationHooks('media', revalidate)

    afterChange({ doc, req: {}, context: {} } as never)

    expect(revalidate.mock.calls[0][0]).toContain('media:list:uk')
  })

  it('falls back to the document id when a delete does not pass one', () => {
    const revalidate = vi.fn()
    const { afterDelete } = revalidationHooks('media', revalidate)

    afterDelete({ doc, id: undefined, req: { locale: 'en' }, context: {} } as never)

    expect(revalidate.mock.calls[0][0]).toContain('media:doc:7:en')
  })
})

describe('isMissingRequestScope', () => {
  it('recognises the invariant Next throws outside a request scope', () => {
    expect(
      isMissingRequestScope(
        new Error('Invariant: static generation store missing in revalidateTag media'),
      ),
    ).toBe(true)
  })

  it('does not swallow a real failure', () => {
    expect(isMissingRequestScope(new Error('tag exceeds 256 characters'))).toBe(false)
    expect(isMissingRequestScope('not an error')).toBe(false)
    expect(isMissingRequestScope(undefined)).toBe(false)
  })
})

describe('revalidator batching', () => {
  it('sends every tag of one write in a single call', () => {
    const revalidate = vi.fn()
    const { afterChange } = revalidationHooks('media', revalidate)

    afterChange({ doc: { id: 7 }, req: { locale: 'en' }, context: {} } as never)

    // One call, not one per tag: a write outside a request scope can then be abandoned after
    // the first failure instead of building a stack trace per tag.
    expect(revalidate).toHaveBeenCalledTimes(1)
    expect(revalidate.mock.calls[0][0]).toHaveLength(3)
  })
})
