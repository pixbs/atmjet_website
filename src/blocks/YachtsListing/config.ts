import type { Block } from 'payload'

/**
 * The charter listing (issue #139, `docs/legacy-inventory.md` section 4, `/yachts` items 2 and
 * 4): the card the fleet is narrowed with, and the grid of what is left.
 *
 * The yachts are documents and the order is in the URL, so what an editor owns here is the two
 * headings: the one over the selects and the one over the grid.
 */
export const yachtsListing: Block = {
  slug: 'yachtsListing',
  interfaceName: 'YachtsListingBlock',
  labels: { singular: 'Yachts listing', plural: 'Yachts listings' },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'The heading over the selects.' },
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'The heading over the grid of yachts.' },
    },
  ],
}
