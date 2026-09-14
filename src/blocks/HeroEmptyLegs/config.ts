import type { Block } from 'payload'

/**
 * The hero the empty legs page opens with (issue #133, `docs/legacy-inventory.md` section 4): a
 * gold figure counting up over the heading, and under both a card with a photograph on one side
 * and a heading with its sentence on the other.
 */
export const heroEmptyLegs: Block = {
  slug: 'heroEmptyLegs',
  interfaceName: 'HeroEmptyLegsBlock',
  labels: { singular: 'Empty legs hero', plural: 'Empty legs heroes' },
  fields: [
    {
      name: 'figure',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'Counted up over the heading, as `75%`.' },
    },
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    { name: 'subtitle', type: 'text', required: true, localized: true },
    { name: 'description', type: 'textarea', required: true, localized: true },
  ],
}
