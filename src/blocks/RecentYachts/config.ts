import type { Block } from 'payload'

/**
 * The recent yachts (issue #133, `docs/legacy-inventory.md` section 4, `/sales_yachts` item 4): a
 * heading over a carousel of the yachts for sale, in one card.
 *
 * The listings are documents, so the block carries the heading and how many of them to show. The
 * legacy page read the whole table and drew every row it found (section 13, entry 52).
 */
export const recentYachts: Block = {
  slug: 'recentYachts',
  interfaceName: 'RecentYachtsBlock',
  labels: { singular: 'Recent yachts', plural: 'Recent yachts' },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'limit',
      type: 'number',
      required: true,
      defaultValue: 8,
      min: 1,
      admin: {
        description: 'How many listings the carousel holds, newest first.',
      },
    },
  ],
}
