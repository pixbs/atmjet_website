import type { Block } from 'payload'

import { bookingCta } from '@/fields/nav'

/**
 * The hero the yacht pages open with (issue #114, `docs/legacy-inventory.md` section 5): a line
 * of small capitals, a heading, up to two sentences and, where the page wants one, the button
 * that opens the booking dialog. The legacy charter page passed `isButtonHidden`; here the
 * button is simply left without wording.
 */
export const heroYachts: Block = {
  slug: 'heroYachts',
  interfaceName: 'HeroYachtsBlock',
  labels: { singular: 'Yachts hero', plural: 'Yachts heroes' },
  fields: [
    { name: 'overline', type: 'text', required: true, localized: true },
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'description', type: 'textarea', required: true, localized: true },
    {
      name: 'description2',
      type: 'textarea',
      localized: true,
      admin: { description: 'A second paragraph; the legacy charter page had one, sales none.' },
    },
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    bookingCta('Hero_yachts', { optional: true }),
  ],
}
