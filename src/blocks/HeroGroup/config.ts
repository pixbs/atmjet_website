import type { Block } from 'payload'

/**
 * The hero the group page opens with (issue #133, `docs/legacy-inventory.md` section 4): a word
 * in a pill over the heading, and a sentence under it. The legacy read all three from
 * translation keys.
 */
export const heroGroup: Block = {
  slug: 'heroGroup',
  interfaceName: 'HeroGroupBlock',
  labels: { singular: 'Group hero', plural: 'Group heroes' },
  fields: [
    {
      name: 'chip',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'The word in the pill over the heading.' },
    },
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'description', type: 'textarea', required: true, localized: true },
  ],
}
