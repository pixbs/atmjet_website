import type { File, RequiredDataFromCollectionSlug } from 'payload'
import { uniqueSuffix, type TestRegistry } from '../helpers/payload'

export type MediaData = RequiredDataFromCollectionSlug<'media'>

/** A valid 1×1 PNG, enough for the upload pipeline (sharp) to accept and size it. */
const ONE_PIXEL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
)

export function pngFile(name = `image-${uniqueSuffix()}.png`): File {
  return { data: ONE_PIXEL_PNG, mimetype: 'image/png', name, size: ONE_PIXEL_PNG.length }
}

export function mediaData(overrides: Partial<MediaData> = {}): MediaData {
  return { alt: `Test image ${uniqueSuffix()}`, ...overrides }
}

export function createMedia(
  registry: TestRegistry,
  overrides: Partial<MediaData> = {},
  file: File = pngFile(),
) {
  return registry.create('media', mediaData(overrides), { file })
}
