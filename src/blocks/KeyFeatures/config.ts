import type { Block } from 'payload'

/**
 * The key features carousel (issue #118, `docs/legacy-inventory.md` section 5): the heading
 * beside a row of photographs a visitor scrolls through. The home page ran five of them, the
 * medical aviation page four and the yachts-for-sale page four, each list written into its own
 * page file; they are rows an editor orders now.
 */
export const keyFeatures: Block = {
  slug: 'keyFeatures',
  interfaceName: 'KeyFeaturesBlock',
  labels: { singular: 'Key features', plural: 'Key feature sections' },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'description', type: 'text', localized: true },
    {
      name: 'cards',
      type: 'array',
      minRows: 1,
      labels: { singular: 'Feature', plural: 'Features' },
      fields: [
        { name: 'title', type: 'text', required: true, localized: true },
        { name: 'description', type: 'text', required: true, localized: true },
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
      ],
    },
  ],
}
