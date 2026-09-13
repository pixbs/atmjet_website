import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { getPayloadClient } from '@/lib/data/payload'
import { createMedia } from '../factories'
import { createRegistry, uniqueSuffix, type TestRegistry } from '../helpers/payload'

// Vitest hoists this above every import, so Media closes over the mock when it builds its hooks
// at module load. The real `revalidateTag` needs a Next request scope that Vitest has not got.
const revalidateTag = vi.hoisted(() => vi.fn())
vi.mock('next/cache', () => ({ revalidateTag }))

/**
 * Revalidation wired into a real collection (issue #59, ADR-0007): the Media hooks fire on a
 * write through the Local API and ask Next to drop the collection tag.
 */
let registry: TestRegistry

beforeAll(async () => {
  registry = await createRegistry()
})

afterEach(() => {
  revalidateTag.mockClear()
})

afterAll(() => registry.cleanup())

const tagsPassed = (): string[] => revalidateTag.mock.calls.map(([tag]) => tag as string)

describe('media revalidation', () => {
  it('drops the collection tag when a document is created', async () => {
    await createMedia(registry)

    expect(tagsPassed()).toContain('media')
  })

  it('asks Next to serve stale content while it revalidates', async () => {
    await createMedia(registry)

    // Next 16 deprecated the single-argument form; `max` keeps an editor's save from turning
    // into a blocking cache miss for the next visitor.
    for (const call of revalidateTag.mock.calls) {
      expect(call[1]).toBe('max')
    }
  })

  it('drops the tags again when a document is deleted', async () => {
    const media = await createMedia(registry)
    revalidateTag.mockClear()

    await registry.payload.delete({ collection: 'media', id: media.id, overrideAccess: true })

    expect(tagsPassed()).toContain('media')
  })

  it('stays quiet for a write that opts out, as the E5 importers do', async () => {
    const media = await createMedia(registry)
    revalidateTag.mockClear()

    await registry.payload.update({
      collection: 'media',
      id: media.id,
      data: { alt: `Imported ${uniqueSuffix()}` },
      overrideAccess: true,
      context: { skipRevalidation: true },
    })

    expect(revalidateTag).not.toHaveBeenCalled()
  })
})

describe('getPayloadClient', () => {
  it('hands out one instance rather than opening a pool per call', async () => {
    const [first, second] = await Promise.all([getPayloadClient(), getPayloadClient()])

    expect(first).toBe(second)
  })
})
