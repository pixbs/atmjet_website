import type { Block } from 'payload'

/**
 * The personal manager (issue #124, `docs/legacy-inventory.md` section 5): a photograph beside a
 * gold heading, a sentence and the chips that say what the manager takes off your hands.
 *
 * The chips are rows an editor adds. The legacy section read one string and split it on `;`
 * (section 11.2), which is how a chip came to carry a stray space at either end.
 */
export const personalManager: Block = {
  slug: 'personalManager',
  interfaceName: 'PersonalManagerBlock',
  labels: { singular: 'Personal manager', plural: 'Personal managers' },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'description', type: 'textarea', required: true, localized: true },
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    {
      name: 'chips',
      type: 'array',
      labels: { singular: 'Chip', plural: 'Chips' },
      fields: [{ name: 'label', type: 'text', required: true, localized: true }],
      admin: { description: 'One per box. The legacy section split a single string on `;`.' },
    },
  ],
}
