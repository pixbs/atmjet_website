import type { Block } from 'payload'

/**
 * The hero the partners page opens with (issue #133, `docs/legacy-inventory.md` section 4): a
 * heading with a gold figure counting up inside it, a sentence, and a wide photograph under
 * both. The legacy read the three parts of the heading from three translation keys.
 */
export const heroPartners: Block = {
  slug: 'heroPartners',
  interfaceName: 'HeroPartnersBlock',
  labels: { singular: 'Partners hero', plural: 'Partners heroes' },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'figure',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'Counted up when the hero arrives, painted with the gold gradient.' },
    },
    {
      name: 'title2',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'The rest of the heading, after the figure.' },
    },
    { name: 'description', type: 'textarea', required: true, localized: true },
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
  ],
}
