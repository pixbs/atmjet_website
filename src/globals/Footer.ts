import type { GlobalConfig } from 'payload'

import { anyone, editorOrAdmin } from '@/access'
import { bookingCta, navLinks } from '@/fields/nav'
import { revalidateGlobal } from '@/hooks/revalidate'
import { SOCIAL_NETWORKS } from '@/lib/links'

/**
 * The footer (issue #61): two rows of page links, the social accounts to show, the booking
 * button and the legal line.
 *
 * `socials` picks which accounts appear and in which order; the handles themselves live once in
 * `SiteSettings`, so the footer cannot drift from the rest of the chrome the way the legacy
 * copies did (`docs/legacy-inventory.md` section 9.5).
 */
export const Footer: GlobalConfig = {
  slug: 'footer',
  admin: { group: 'Navigation' },
  access: {
    read: anyone,
    update: editorOrAdmin,
  },
  hooks: { afterChange: [revalidateGlobal('footer').afterChange] },
  fields: [
    navLinks('primaryNav', 'The first row of page links.'),
    navLinks('secondaryNav', 'The second row of page links.'),
    {
      name: 'socials',
      type: 'select',
      hasMany: true,
      defaultValue: [...SOCIAL_NETWORKS],
      options: SOCIAL_NETWORKS.map((network) => ({
        value: network,
        label: network.charAt(0).toUpperCase() + network.slice(1),
      })),
      admin: { description: 'Which accounts to link, in the order they are shown.' },
    },
    {
      name: 'background',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'The photograph behind the footer. The legacy site served a 1.5 MB JPEG where a 92 KB WebP of the same picture sat beside it (section 13, entry 83).',
      },
    },
    bookingCta('Footer'),
    {
      name: 'legal',
      type: 'group',
      fields: [
        {
          name: 'location',
          type: 'text',
          required: true,
          localized: true,
          admin: { description: 'The city and phone line above the copyright.' },
        },
        {
          name: 'copyright',
          type: 'text',
          required: true,
          localized: true,
          admin: {
            description:
              'Use {year} where the current year belongs, as the legacy line did; it is filled in when the page renders.',
          },
        },
      ],
    },
  ],
}
