import type { Block } from 'payload'

/**
 * The advantages the sales department page lists (issue #128,
 * `docs/legacy-inventory.md` section 5): a wide photograph with three columns under it, read
 * from seven translation keys and one hard-coded picture.
 */
export const advantages: Block = {
  slug: 'advantages',
  interfaceName: 'AdvantagesBlock',
  labels: { singular: 'Advantages', plural: 'Advantage sections' },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    {
      name: 'cards',
      type: 'array',
      minRows: 1,
      // Three side by side is what the legacy row was drawn for.
      maxRows: 3,
      labels: { singular: 'Advantage', plural: 'Advantages' },
      fields: [
        { name: 'title', type: 'text', required: true, localized: true },
        { name: 'description', type: 'text', required: true, localized: true },
      ],
    },
  ],
}
