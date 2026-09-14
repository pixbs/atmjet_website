import type { Block } from 'payload'

/**
 * The grid of photographs the home page scaled in as it was scrolled to (issue #122,
 * `docs/legacy-inventory.md` section 5): eight slices of one picture, hard-coded as
 * `/images/tiles/slice_0..7.webp`.
 */
export const tiles: Block = {
  slug: 'tiles',
  interfaceName: 'TilesBlock',
  labels: { singular: 'Tiles', plural: 'Tile grids' },
  fields: [
    {
      name: 'tiles',
      type: 'array',
      minRows: 1,
      labels: { singular: 'Tile', plural: 'Tiles' },
      admin: { description: 'Two to a row on a narrow screen, three from the medium width up.' },
      fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
    },
  ],
}
