import type { Block } from 'payload'

/**
 * The yachts promotion (issue #121, `docs/legacy-inventory.md` section 5): the heading over a
 * card with a wide photograph, what the fleet offers in three columns, and the invitation
 * through to the yachts page. The home page and the group page ran it off four translation
 * keys and two hard-coded pictures.
 */
export const yachtsPromo: Block = {
  slug: 'yachtsPromo',
  interfaceName: 'YachtsPromoBlock',
  labels: { singular: 'Yachts promotion', plural: 'Yachts promotions' },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'description', type: 'text', localized: true },
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    {
      name: 'columns',
      type: 'array',
      minRows: 1,
      maxRows: 3,
      labels: { singular: 'Column', plural: 'Columns' },
      admin: {
        description: 'The three the legacy card carried, side by side from the medium width up.',
      },
      fields: [
        { name: 'title', type: 'text', required: true, localized: true },
        { name: 'description', type: 'text', required: true, localized: true },
      ],
    },
    {
      name: 'invitation',
      type: 'group',
      admin: { description: 'The card inside the card: a picture, a line and the way through.' },
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
          admin: { description: 'The page the button opens. Its slug decides the URL.' },
        },
      ],
    },
  ],
}
