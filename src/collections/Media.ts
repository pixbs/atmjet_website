import type { CollectionConfig } from 'payload'

import { anyone, editorOrAdmin } from '@/access'
import { nextRevalidationHooks } from '@/lib/data/revalidate-next'

/**
 * Uploads (issue #62). The legacy admin accepted any file type and every image was served in
 * whatever size it happened to have (docs/legacy-inventory.md sections 12 and 14), so two things
 * change while porting: the type allowlist, and generated sizes that match what the pages render.
 *
 * `externalUrl` carries objects that still live on the legacy hosts. The media migration
 * (E5.12) imports those rows first and mirrors the files afterwards, so a document can point at
 * a legacy URL before the object exists in this bucket; `mediaUrl()` in src/lib/media-url.ts is
 * what components read, and it prefers that URL when it is set.
 */

/** The types the site actually uses. Anything else is rejected with a readable error. */
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'video/mp4',
  'video/webm',
  'application/pdf',
]

/**
 * Widths the pages render, from the narrowest consumer up: card grids, content columns,
 * galleries and full-bleed heroes. Images are never enlarged, so a small source keeps its size
 * and simply has fewer variants.
 */
export const IMAGE_SIZES = [
  { name: 'thumbnail', width: 400 },
  { name: 'card', width: 768 },
  { name: 'gallery', width: 1280 },
  { name: 'hero', width: 1920 },
] as const

export const Media: CollectionConfig = {
  slug: 'media',
  admin: { useAsTitle: 'filename', defaultColumns: ['filename', 'alt', 'updatedAt'] },
  // Media feeds every page that renders an image, so a save has to drop the cached HTML that
  // embedded it (ADR-0007, docs/conventions/rendering.md).
  hooks: {
    afterChange: [nextRevalidationHooks('media').afterChange],
    afterDelete: [nextRevalidationHooks('media').afterDelete],
  },
  access: {
    // Uploads are public; everything that changes them needs an editor (docs/access-matrix.md).
    read: anyone,
    create: editorOrAdmin,
    update: editorOrAdmin,
    delete: editorOrAdmin,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'What the image shows, in this locale. Read out by screen readers.' },
    },
    {
      name: 'externalUrl',
      type: 'text',
      admin: {
        description:
          'Set while the file still lives on a legacy host. Components prefer it over the upload.',
      },
    },
  ],
  upload: {
    mimeTypes: ALLOWED_MIME_TYPES,
    focalPoint: true,
    imageSizes: IMAGE_SIZES.map((size) => ({
      name: size.name,
      width: size.width,
      position: 'centre',
      withoutEnlargement: true,
    })),
    adminThumbnail: 'thumbnail',
  },
}
