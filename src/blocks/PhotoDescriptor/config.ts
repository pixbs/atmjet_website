import type { Block } from 'payload'

/**
 * A heading and a sentence over a photograph (issue #133, `docs/legacy-inventory.md` section 4):
 * the section the yachts for sale page closes its argument with. The legacy centred both lines
 * in a narrow column and hung one tall picture under them.
 */
export const photoDescriptor: Block = {
  slug: 'photoDescriptor',
  interfaceName: 'PhotoDescriptorBlock',
  labels: { singular: 'Descriptor with photograph', plural: 'Descriptors with photograph' },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'description', type: 'textarea', required: true, localized: true },
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
  ],
}
