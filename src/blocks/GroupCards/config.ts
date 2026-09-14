import type { Block } from 'payload'

/**
 * The arms of the group, as `/atm_jet_group` lists them (issue #130,
 * `docs/legacy-inventory.md` section 4): a photograph each with the copy laid over it and a
 * button into that part of the site. The legacy read them from six translation keys and two
 * hard-coded pictures, and linked by a path rather than to a page.
 */
export const groupCards: Block = {
  slug: 'groupCards',
  interfaceName: 'GroupCardsBlock',
  labels: { singular: 'Group cards', plural: 'Group card sections' },
  fields: [
    {
      name: 'cards',
      type: 'array',
      minRows: 1,
      labels: { singular: 'Card', plural: 'Cards' },
      admin: { description: 'One under the next, with a rule between them.' },
      fields: [
        { name: 'title', type: 'text', required: true, localized: true },
        { name: 'description', type: 'textarea', required: true, localized: true },
        { name: 'label', type: 'text', required: true, localized: true },
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        {
          name: 'page',
          type: 'relationship',
          relationTo: 'pages',
          // Optional for the reason every link to a page is (src/fields/nav.ts): a required
          // relationship is a NOT NULL column and deleting the page would fail instead.
          admin: { description: 'The page this card opens. Its slug decides the URL.' },
        },
      ],
    },
  ],
}
