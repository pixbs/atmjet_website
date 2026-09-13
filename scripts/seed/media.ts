import type { File, Payload } from 'payload'
import { PNG } from 'pngjs'
import type { SeedOutcome } from './report'

interface SeedImage {
  filename: string
  alt: string
  rgb: [number, number, number]
}

/** Placeholder images in the brand palette; real assets arrive with the media migration (issue #84). */
export const SEED_IMAGES: SeedImage[] = [
  { filename: 'seed-gold.png', alt: 'Gold placeholder', rgb: [223, 171, 83] },
  { filename: 'seed-surface.png', alt: 'Dark surface placeholder', rgb: [26, 26, 26] },
]

export function solidPng(
  width: number,
  height: number,
  [r, g, b]: [number, number, number],
): Buffer {
  const png = new PNG({ width, height })
  for (let index = 0; index < width * height; index += 1) {
    png.data[index * 4] = r
    png.data[index * 4 + 1] = g
    png.data[index * 4 + 2] = b
    png.data[index * 4 + 3] = 255
  }
  return PNG.sync.write(png)
}

function fileFor(image: SeedImage): File {
  const data = solidPng(1280, 720, image.rgb)
  return { data, mimetype: 'image/png', name: image.filename, size: data.length }
}

export async function seedMedia(payload: Payload): Promise<SeedOutcome[]> {
  const outcomes: SeedOutcome[] = []
  for (const image of SEED_IMAGES) {
    const existing = await payload.find({
      collection: 'media',
      where: { filename: { equals: image.filename } },
      limit: 1,
      overrideAccess: true,
    })
    if (existing.totalDocs > 0) {
      outcomes.push({
        collection: 'media',
        key: image.filename,
        action: 'unchanged',
        id: existing.docs[0].id,
      })
      continue
    }
    const created = await payload.create({
      collection: 'media',
      data: { alt: image.alt },
      file: fileFor(image),
      overrideAccess: true,
      // A bulk write has nothing to invalidate: the seed runs before anything is cached
      // (docs/conventions/rendering.md).
      context: { skipRevalidation: true },
    })
    outcomes.push({ collection: 'media', key: image.filename, action: 'created', id: created.id })
  }
  return outcomes
}
