import { describe, expect, it, vi } from 'vitest'

import { ALL_LOCALES } from '@/i18n/locales'
import { revalidationHooks } from '@/lib/data/revalidate'
import { tagsForWrite } from '@/lib/data/tags'

/**
 * Cache tags and the collection hooks that invalidate them (issue #59, ADR-0007). The Next
 * binding lives in revalidate-next.ts; here the revalidator is a spy, so the rules can be
 * checked without a request scope.
 */
describe('cache tags', () => {
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
