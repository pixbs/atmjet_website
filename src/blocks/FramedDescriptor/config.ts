import type { Block } from 'payload'

/**
 * A heading inside a gold frame (issue #133, `docs/legacy-inventory.md` section 4): the line the
 * yachts for sale page puts between its carousels. The legacy drew the frame as a gold box with
 * a darker one inside it, and read the one string from a translation key.
 */
export const framedDescriptor: Block = {
  slug: 'framedDescriptor',
  interfaceName: 'FramedDescriptorBlock',
  labels: { singular: 'Framed descriptor', plural: 'Framed descriptors' },
  fields: [{ name: 'title', type: 'text', required: true, localized: true }],
}
