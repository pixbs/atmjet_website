import type { Block } from 'payload'

import { bookingCta } from '@/fields/nav'

/**
 * The empty legs section (issue #117, `docs/legacy-inventory.md` section 5): the heading that
 * stands beside the list of repositioning flights, and under the flights the card inviting a
 * visitor to the Telegram channel the new ones are posted to.
 *
 * The flights themselves are documents rather than fields: the section reads the EmptyLegs
 * collection (`src/lib/data/empty-legs.ts`), so an editor keeps them in one place instead of
 * retyping them into every page that lists them. What is written here is the wording around
 * them, which is what the legacy section read from six translation keys.
 */
export const emptyLegs: Block = {
  slug: 'emptyLegs',
  interfaceName: 'EmptyLegsBlock',
  labels: { singular: 'Empty legs', plural: 'Empty legs' },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'description', type: 'textarea', required: true, localized: true },
    {
      name: 'limit',
      type: 'number',
      required: true,
      defaultValue: 12,
      min: 1,
      admin: {
        description:
          'How many flights to list, lowest order first. The legacy section listed the whole table, however long it had grown.',
      },
    },
    bookingCta('Empty-legs'),
    {
      name: 'channel',
      type: 'group',
      label: 'Telegram channel card',
      fields: [
        { name: 'title', type: 'text', required: true, localized: true },
        { name: 'description', type: 'textarea', required: true, localized: true },
        { name: 'label', type: 'text', required: true, localized: true },
        {
          name: 'account',
          type: 'text',
          required: true,
          defaultValue: 'atmjet1',
          admin: {
            description:
              'The channel the new flights are posted to, as a bare handle. The legacy link was typed as a scheme no browser follows (section 13, entry 54).',
          },
        },
      ],
    },
  ],
}
