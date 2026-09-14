import type { Block } from 'payload'

import { bookingCta } from '@/fields/nav'

/**
 * The hero the sales department page opens with (issue #113,
 * `docs/legacy-inventory.md` section 5): a line of small capitals, a headline whose figures
 * count up, a sentence and the button that opens the booking dialog, over a photograph filling
 * the screen. The legacy read all seven strings from translation keys.
 */
export const heroSales: Block = {
  slug: 'heroSales',
  interfaceName: 'HeroSalesBlock',
  labels: { singular: 'Sales hero', plural: 'Sales heroes' },
  fields: [
    { name: 'overline', type: 'text', required: true, localized: true },
    {
      name: 'lines',
      type: 'array',
      minRows: 1,
      // Two, as the legacy headline was written; a third would push the button off the screen.
      maxRows: 2,
      labels: { singular: 'Line', plural: 'Lines' },
      fields: [
        {
          name: 'figure',
          type: 'text',
          required: true,
          localized: true,
          admin: { description: 'Counted up when the hero arrives, as `20+`.' },
        },
        { name: 'text', type: 'text', required: true, localized: true },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      localized: true,
      admin: { description: 'The lines are kept where they are typed, as the legacy split them.' },
    },
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    bookingCta('Hero_sales'),
  ],
}
