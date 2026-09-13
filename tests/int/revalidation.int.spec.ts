import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { getPayloadClient } from '@/lib/data/payload'
import { createMedia } from '../factories'
import { createRegistry, uniqueSuffix, type TestRegistry } from '../helpers/payload'

// Vitest hoists this above every import, so Media closes over the mock when it builds its hooks
// at module load. The real `revalidateTag` needs a Next request scope that Vitest has not got.
const revalidateTag = vi.hoisted(() => vi.fn())
vi.mock('next/cache', () => ({ revalidateTag }))

/**
 * Revalidation wired into a real collection (issue #59, ADR-0007). The unit tests pin the tag
 * rules; this one proves the Media hooks actually fire on a write through the Local API and ask
 * Next to drop the right tags.
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
  it('drops the collection, listing and document tags when a document is created', async () => {
    const media = await createMedia(registry)

    expect(tagsPassed()).toContain('media')
    expect(tagsPassed()).toContain('media:list:en')
    expect(tagsPassed()).toContain(`media:doc:${media.id}:en`)
  })

  it('asks Next to serve stale content while it revalidates', async () => {
    await createMedia(registry)

    // Next 16 deprecated the single-argument form; `max` keeps an editor's save from turning
    // into a blocking cache miss for the next visitor.
    for (const call of revalidateTag.mock.calls) {
      expect(call[1]).toBe('max')
    }
  })

  it('drops only the written locale when an editor saves a translation', async () => {
    const media = await createMedia(registry)
    revalidateTag.mockClear()

    await registry.payload.update({
      collection: 'media',
      id: media.id,
      data: { alt: `Перевод ${uniqueSuffix()}` },
      locale: 'ru',
      overrideAccess: true,
    })

    expect(tagsPassed()).toContain(`media:doc:${media.id}:ru`)
    expect(tagsPassed()).not.toContain(`media:doc:${media.id}:en`)
    expect(tagsPassed()).not.toContain('media:list:uk')
  })

  it('drops the tags again when a document is deleted', async () => {
    const media = await createMedia(registry)
    revalidateTag.mockClear()

    await registry.payload.delete({ collection: 'media', id: media.id, overrideAccess: true })

    expect(tagsPassed()).toContain(`media:doc:${media.id}:en`)
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
