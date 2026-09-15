import type { Block } from 'payload'

/**
 * The aircraft the sales department page shows (issue #142, `docs/legacy-inventory.md` section 4,
 * `/sales_dept` item 3): a heading over a carousel of the catalogue, in one card.
 *
 * The aircraft are documents, so the block carries the heading and how many of them to show. The
 * legacy page took the fifteen newest rows of the `vehicles` table and drew a card for each.
 */
export const catalogueAircraft: Block = {
  slug: 'catalogueAircraft',
  interfaceName: 'CatalogueAircraftBlock',
  labels: { singular: 'Aircraft carousel', plural: 'Aircraft carousels' },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'limit',
      type: 'number',
      required: true,
      defaultValue: 15,
      min: 1,
      admin: { description: 'How many aircraft the carousel holds, newest first.' },
    },
  ],
}
