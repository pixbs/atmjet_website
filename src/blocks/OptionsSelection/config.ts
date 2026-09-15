import type { Block } from 'payload'

/**
 * What the sales departments do for a buyer (issue #127, `docs/legacy-inventory.md` section 5):
 * a heading over two cards, each a photograph, a paragraph and the numbered promises under it.
 *
 * The promises are rows an editor adds. The legacy section read one string per card and split it
 * on ` \n` (section 11.2), which is the pattern issue #72 settled as an array field.
 */
export const optionsSelection: Block = {
  slug: 'optionsSelection',
  interfaceName: 'OptionsSelectionBlock',
  labels: { singular: 'Options selection', plural: 'Options selections' },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'cards',
      type: 'array',
      minRows: 1,
      labels: { singular: 'Card', plural: 'Cards' },
      admin: { description: 'The legacy section drew two, side by side from the wide breakpoint.' },
      fields: [
        { name: 'title', type: 'text', required: true, localized: true },
        { name: 'description', type: 'textarea', required: true, localized: true },
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        {
          name: 'items',
          type: 'array',
          minRows: 1,
          labels: { singular: 'Item', plural: 'Items' },
          admin: { description: 'One per box, under the paragraph.' },
          fields: [{ name: 'text', type: 'text', required: true, localized: true }],
        },
      ],
    },
  ],
}
