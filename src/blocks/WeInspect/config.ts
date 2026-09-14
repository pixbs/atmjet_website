import type { Block } from 'payload'

/**
 * What is checked before a yacht is sold, as the yachts for sale page shows it (issue #126,
 * `docs/legacy-inventory.md` section 5): a heading over a row of cards that scrolls. The legacy
 * read five of them from a translation namespace whose name was misspelled, and five drawings.
 */
export const weInspect: Block = {
  slug: 'weInspect',
  interfaceName: 'WeInspectBlock',
  labels: { singular: 'We inspect', plural: 'We inspect sections' },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'slides',
      type: 'array',
      minRows: 1,
      labels: { singular: 'Slide', plural: 'Slides' },
      admin: { description: 'Shown in this order; the row scrolls when they do not fit.' },
      fields: [
        { name: 'title', type: 'text', required: true, localized: true },
        { name: 'description', type: 'textarea', required: true, localized: true },
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
      ],
    },
  ],
}
