import { describe, expect, it } from 'vitest'

import { mediaUrl } from '@/lib/media-url'

/**
 * Components read uploads through this resolver (issue #62), because a document can still point
 * at a legacy host while the media migration runs, and not every image has every size.
 */
describe('media url', () => {
  const upload = {
    url: '/api/media/file/hero.jpg',
    sizes: { card: { url: '/api/media/file/hero-768.jpg' }, hero: { url: null } },
  }

  it('returns the original upload when no size is asked for', () => {
    expect(mediaUrl(upload)).toBe('/api/media/file/hero.jpg')
  })

  it('returns the generated size when it exists', () => {
    expect(mediaUrl(upload, 'card')).toBe('/api/media/file/hero-768.jpg')
  })

  it('falls back to the original when the size was not generated', () => {
    expect(mediaUrl(upload, 'hero')).toBe('/api/media/file/hero.jpg')
    expect(mediaUrl(upload, 'thumbnail')).toBe('/api/media/file/hero.jpg')
  })

  it('prefers a legacy host over anything in this bucket', () => {
    expect(mediaUrl({ ...upload, externalUrl: 'https://legacy.example/hero.jpg' }, 'card')).toBe(
      'https://legacy.example/hero.jpg',
    )
  })

  it('has nothing to return for a missing or empty document', () => {
    expect(mediaUrl(null)).toBeUndefined()
    expect(mediaUrl(undefined, 'card')).toBeUndefined()
    expect(mediaUrl({})).toBeUndefined()
  })
})
