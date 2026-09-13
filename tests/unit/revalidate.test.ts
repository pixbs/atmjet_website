import { describe, expect, it, vi } from 'vitest'

const revalidateTag = vi.hoisted(() => vi.fn())
vi.mock('next/cache', () => ({ revalidateTag }))

import { revalidateCollection } from '@/hooks/revalidate'

/** The hook every collection that feeds a page installs (ADR-0007). */
const doc = { id: 7 } as never
const hooks = revalidateCollection('media')

describe('revalidateCollection', () => {
  it('drops the collection tag with the max profile after a change and after a delete', () => {
    revalidateTag.mockClear()

    expect(hooks.afterChange({ doc, req: {}, context: {} } as never)).toBe(doc)
    expect(hooks.afterDelete({ doc, id: 7, req: {}, context: {} } as never)).toBe(doc)

    expect(revalidateTag.mock.calls).toEqual([
      ['media', 'max'],
      ['media', 'max'],
    ])
  })

  it('stays quiet for a write that opts out, as the importers do', () => {
    revalidateTag.mockClear()

    hooks.afterChange({ doc, req: {}, context: { skipRevalidation: true } } as never)

    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it('ignores Next refusing outside a request scope and rethrows anything else', () => {
    revalidateTag.mockImplementationOnce(() => {
      throw new Error('Invariant: static generation store missing in revalidateTag media')
    })
    expect(() => hooks.afterChange({ doc, req: {}, context: {} } as never)).not.toThrow()

    revalidateTag.mockImplementationOnce(() => {
      throw new Error('tag exceeds 256 characters')
    })
    expect(() => hooks.afterChange({ doc, req: {}, context: {} } as never)).toThrow(/256/)
  })
})
