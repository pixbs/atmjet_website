import type { Block } from 'payload'

import { bookingCta } from '@/fields/nav'

/**
 * The price promise the business agents page closes on (issue #125,
 * `docs/legacy-inventory.md` section 5): a gold heading, a sentence under it and the button that
 * opens the booking dialog, with a photograph beside them. The legacy read the words from three
 * translation keys and hard-coded the picture.
 */
export const bestPrice: Block = {
  slug: 'bestPrice',
  interfaceName: 'BestPriceBlock',
  labels: { singular: 'Best price', plural: 'Best price sections' },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'description', type: 'textarea', required: true, localized: true },
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    bookingCta('Best_price'),
  ],
}
