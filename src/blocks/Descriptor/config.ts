import type { Block } from 'payload'

/**
 * A heading with a sentence under it (issue #133, `docs/legacy-inventory.md` section 4): the
 * paragraph the empty legs page puts between its hero and the list of flights. The legacy read
 * both words from translation keys and drew nothing else.
 */
export const descriptor: Block = {
  slug: 'descriptor',
  interfaceName: 'DescriptorBlock',
  labels: { singular: 'Descriptor', plural: 'Descriptors' },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'description', type: 'textarea', required: true, localized: true },
  ],
}
