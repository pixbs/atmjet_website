import type { Block } from 'payload'

/**
 * The personal manager section (issue #124, `docs/legacy-inventory.md` section 5): a gold
 * heading, a paragraph and a row of chips beside a photograph of the manager. The legacy read
 * the three from translation keys and cut the chips out of one string on its semicolons.
 */
export const personalManager: Block = {
  slug: 'personalManager',
  interfaceName: 'PersonalManagerBlock',
  labels: { singular: 'Personal manager', plural: 'Personal manager sections' },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'description', type: 'textarea', required: true, localized: true },
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    {
      name: 'chips',
      type: 'array',
      minRows: 1,
      labels: { singular: 'Chip', plural: 'Chips' },
      admin: { description: 'Shown in a row under the paragraph, in the order written here.' },
      fields: [{ name: 'text', type: 'text', required: true, localized: true }],
    },
  ],
}
