import { describe, expect, it, vi } from 'vitest'

const revalidateTag = vi.hoisted(() => vi.fn())
const revalidatePath = vi.hoisted(() => vi.fn())
vi.mock('next/cache', () => ({ revalidatePath, revalidateTag }))

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

  it('drops the rendered pages as well, which is what an editor sees change', () => {
    // The tag reaches nothing a visitor is served: a page reads Payload through the Local API,
    // so what Next cached carries only its own path tags (issue #178).
    revalidatePath.mockClear()

    hooks.afterChange({ doc, req: {}, context: {} } as never)
    hooks.afterDelete({ doc, id: 7, req: {}, context: {} } as never)

    expect(revalidatePath.mock.calls).toEqual([
      ['/', 'layout'],
      ['/', 'layout'],
    ])
  })

  it('stays quiet for a write that opts out, as the importers do', () => {
    revalidateTag.mockClear()
    revalidatePath.mockClear()

    hooks.afterChange({ doc, req: {}, context: { skipRevalidation: true } } as never)

    expect(revalidateTag).not.toHaveBeenCalled()
    expect(revalidatePath).not.toHaveBeenCalled()
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
