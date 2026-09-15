import type { Block } from 'payload'

/**
 * The reasons to fly with the company, as eight legacy pages stacked them (issue #116,
 * `docs/legacy-inventory.md` section 5). Each page passed its own `cards` and `images` arrays
 * from its file; they are rows an editor orders now.
 *
 * Seven of the eight drew a heading beside the stack in a box that clips it. The group charters
 * page laid the same cards straight into the container, with neither (section 4, issue #145),
 * which is what `variant` is.
 */
export const whyUs: Block = {
  slug: 'whyUs',
  interfaceName: 'WhyUsBlock',
  labels: { singular: 'Why us', plural: 'Why us sections' },
  fields: [
    {
      name: 'variant',
      type: 'select',
      required: true,
      defaultValue: 'stacked',
      options: [
        { value: 'stacked', label: 'Heading beside the stack' },
        { value: 'bare', label: 'The cards alone' },
      ],
      admin: {
        description:
          'The group charters page laid the same cards straight into the container, with no heading and nothing clipping them (section 4).',
      },
    },
    {
      name: 'title',
      type: 'text',
      localized: true,
      admin: { description: 'The heading beside the cards. The cards alone have none.' },
    },
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
        {
          name: 'title',
          type: 'text',
          localized: true,
          admin: {
            description: 'The citizens cards carry their reason in the sentence alone (#149).',
          },
        },
        { name: 'description', type: 'text', required: true, localized: true },
        { name: 'image', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
}
