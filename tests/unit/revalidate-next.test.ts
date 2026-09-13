import { describe, expect, it, vi } from 'vitest'

const revalidateTag = vi.hoisted(() => vi.fn())
vi.mock('next/cache', () => ({ revalidateTag }))

import { nextRevalidationHooks } from '@/lib/data/revalidate-next'

/**
 * The Next binding of the revalidation hooks (issue #59). The tag rules live in
 * revalidate.test.ts; this file pins how the binding behaves when Next refuses.
 */
const doc = { id: 7 } as never
const change = { doc, req: { locale: 'en' }, context: {} } as never

describe('nextRevalidationHooks', () => {
  it('passes the max profile, so a save never blocks the next visitor', () => {
    revalidateTag.mockReset()
    nextRevalidationHooks('media').afterChange(change)

    expect(revalidateTag).toHaveBeenCalledWith('media', 'max')
  })

  it('gives up on the whole write once Next says there is no request scope', () => {
    revalidateTag.mockReset()
    revalidateTag.mockImplementation(() => {
      throw new Error('Invariant: static generation store missing in revalidateTag media')
    })

    expect(() => nextRevalidationHooks('media').afterChange(change)).not.toThrow()

    // One attempt, not one per tag: an importer writing thousands of rows would otherwise
    // build a stack trace for every tag of every row.
    expect(revalidateTag).toHaveBeenCalledTimes(1)
  })

  it('lets a real failure through instead of hiding it', () => {
    revalidateTag.mockReset()
    revalidateTag.mockImplementation(() => {
      throw new Error('tag exceeds 256 characters')
    })

    expect(() => nextRevalidationHooks('media').afterChange(change)).toThrow(/256 characters/)
  })
})
