import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { createMedia, mediaData, pngFile } from '../factories'
import { createRegistry, uniqueSuffix, type TestRegistry } from '../helpers/payload'

/**
 * The upload pipeline (issue #62): the sizes the pages render, the type allowlist the legacy
 * admin never had, the localized alt text and the legacy-host escape hatch.
 */
let registry: TestRegistry

beforeAll(async () => {
  registry = await createRegistry()
})

afterAll(() => registry.cleanup())

describe('media', () => {
  it('generates every configured size for an upload', async () => {
    const media = await createMedia(registry)

    for (const size of ['thumbnail', 'card', 'gallery', 'hero']) {
      expect(media.sizes, `${size} is missing`).toHaveProperty(size)
    }
  })

  it('rejects a type the site does not use', async () => {
    const suffix = uniqueSuffix()
    const data = Buffer.from('not really a document')

    await expect(
      registry.payload.create({
        collection: 'media',
        data: mediaData(),
        file: {
          data,
          mimetype: 'application/x-msdownload',
          name: `rejected-${suffix}.exe`,
          size: data.length,
        },
      }),
    ).rejects.toThrow()
  })

  it('keeps a separate alt text per locale', async () => {
    const media = await createMedia(registry, { alt: 'A jet on the apron' })

    await registry.payload.update({
      collection: 'media',
      id: media.id,
      locale: 'ru',
      data: { alt: 'Самолёт на перроне' },
    })

    const english = await registry.payload.findByID({ collection: 'media', id: media.id })
    const russian = await registry.payload.findByID({
      collection: 'media',
      id: media.id,
      locale: 'ru',
    })

    expect(english.alt).toBe('A jet on the apron')
    expect(russian.alt).toBe('Самолёт на перроне')
  })

  it('requires alt text', async () => {
    await expect(
      registry.payload.create({
        collection: 'media',
        data: { alt: '' },
        file: pngFile(),
      }),
    ).rejects.toThrow()
  })
})
