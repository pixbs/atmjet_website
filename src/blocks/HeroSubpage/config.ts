import type { Block } from 'payload'

/**
 * The hero four subpages open with (issue #112, `docs/legacy-inventory.md` section 5): a
 * heading, a sentence under it, and a wide photograph under both. The legacy passed the three
 * as props from each page file, so changing a word meant a deploy; here they are an editor's.
 */
export const heroSubpage: Block = {
  slug: 'heroSubpage',
  interfaceName: 'HeroSubpageBlock',
  labels: { singular: 'Subpage hero', plural: 'Subpage heroes' },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'description',
      type: 'text',
      localized: true,
      admin: { description: 'The sentence under the heading; the legacy citizens page had none.' },
    },
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
  ],
}
