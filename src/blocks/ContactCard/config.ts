import type { Block } from 'payload'

import { bookingCta } from '@/fields/nav'

/**
 * The card the aircraft listing puts between its hero and the aircraft (issue #133,
 * `docs/legacy-inventory.md` section 4): a heading, a sentence and the button that opens the
 * booking dialog, over a photograph darkened until the words can be read on it.
 */
export const contactCard: Block = {
  slug: 'contactCard',
  interfaceName: 'ContactCardBlock',
  labels: { singular: 'Contact card', plural: 'Contact cards' },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'description', type: 'textarea', required: true, localized: true },
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    bookingCta('Contact_us_aircraft'),
  ],
}
