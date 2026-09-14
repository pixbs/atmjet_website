import type { Block } from 'payload'

/**
 * The opening of the business agents page (issue #131, `docs/legacy-inventory.md` section 4):
 * the page heading, then what the company offers an agent, point by point, beside a
 * photograph. The legacy read it from four translation keys and one hard-coded picture.
 */
export const guide: Block = {
  slug: 'guide',
  interfaceName: 'GuideBlock',
  labels: { singular: 'Guide', plural: 'Guides' },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'heading',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'The heading over the points, under the page title.' },
    },
    {
      name: 'points',
      type: 'array',
      minRows: 1,
      labels: { singular: 'Point', plural: 'Points' },
      admin: { description: 'Each one carries the diamond, with a rule between them.' },
      fields: [{ name: 'text', type: 'textarea', required: true, localized: true }],
    },
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
  ],
}
