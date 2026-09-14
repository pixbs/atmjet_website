import type { Block } from 'payload'

/**
 * The reasons to fly with the company, as eight legacy pages stacked them (issue #116,
 * `docs/legacy-inventory.md` section 5). Each page passed its own `cards` and `images` arrays
 * from its file; they are rows an editor orders now.
 */
export const whyUs: Block = {
  slug: 'whyUs',
  interfaceName: 'WhyUsBlock',
  labels: { singular: 'Why us', plural: 'Why us sections' },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'description', type: 'text', localized: true },
    {
      name: 'cards',
      type: 'array',
      minRows: 1,
      labels: { singular: 'Reason', plural: 'Reasons' },
      admin: { description: 'Each one comes to rest a little lower than the one above it.' },
      fields: [
        {
          name: 'figure',
          type: 'text',
          localized: true,
          admin: {
            description: 'Counted up when the card arrives, as `20+`; some pages had none.',
          },
        },
        { name: 'title', type: 'text', required: true, localized: true },
        { name: 'description', type: 'text', required: true, localized: true },
        { name: 'image', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
}
