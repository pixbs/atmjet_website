import type { Block } from 'payload'

/**
 * The documents a visitor can download (issue #131, `docs/legacy-inventory.md` section 4): the
 * checklist and the presentation the business agents page offers. The legacy chose between two
 * hard-coded addresses per document by comparing the locale; the file is a Media document here,
 * localized, so each language points at its own.
 */
export const documents: Block = {
  slug: 'documents',
  interfaceName: 'DocumentsBlock',
  labels: { singular: 'Documents', plural: 'Document sections' },
  fields: [
    {
      name: 'documents',
      type: 'array',
      minRows: 1,
      labels: { singular: 'Document', plural: 'Documents' },
      fields: [
        { name: 'title', type: 'text', required: true, localized: true },
        { name: 'label', type: 'text', required: true, localized: true },
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        {
          name: 'file',
          type: 'upload',
          relationTo: 'media',
          required: true,
          localized: true,
          admin: { description: 'The file this document opens, in this language.' },
        },
      ],
    },
  ],
}
