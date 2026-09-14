import type { Block } from 'payload'

/**
 * The two tiles the home page offers its trade visitors (issue #119,
 * `docs/legacy-inventory.md` section 5): a photograph each, a heading and the way through,
 * hard-coded down to the two pictures and the two hrefs.
 */
export const optionsTiles: Block = {
  slug: 'optionsTiles',
  interfaceName: 'OptionsTilesBlock',
  labels: { singular: 'Options tiles', plural: 'Options tile sections' },
  fields: [
    {
      name: 'tiles',
      type: 'array',
      minRows: 1,
      // Two side by side is what the legacy row was drawn for.
      maxRows: 2,
      labels: { singular: 'Tile', plural: 'Tiles' },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'title', type: 'text', required: true, localized: true },
        { name: 'label', type: 'text', required: true, localized: true },
        {
          name: 'page',
          type: 'relationship',
          relationTo: 'pages',
          // Optional for the reason every link to a page is (src/fields/nav.ts): a required
          // relationship is a NOT NULL column and deleting the page would fail instead.
          admin: { description: 'The page this tile opens. Its slug decides the URL.' },
        },
        {
          name: 'dim',
          type: 'checkbox',
          admin: {
            description: 'Darkens the photograph further, as the second legacy tile was.',
          },
        },
      ],
    },
  ],
}
