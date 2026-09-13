import type { GlobalConfig } from 'payload'

import { anyone, editorOrAdmin } from '@/access'
import { bookingCta, navLinks } from '@/fields/nav'
import { revalidateGlobal } from '@/hooks/revalidate'

/**
 * The navigation the header overlay opens (issue #61).
 *
 * The legacy navbar split its links into two halves that read as one menu
 * (`docs/legacy-inventory.md` section 3.3): the services on the left, the company and the fleet
 * on the right. The two lists are kept apart here because the layout depends on them, not
 * because they mean different things.
 */
export const Header: GlobalConfig = {
  slug: 'header',
  admin: { group: 'Navigation' },
  access: {
    // Read by every page; written by the people who run the content (docs/access-matrix.md).
    read: anyone,
    update: editorOrAdmin,
  },
  hooks: { afterChange: [revalidateGlobal('header').afterChange] },
  fields: [
    navLinks('primaryNav', 'The left-hand column of the open menu.'),
    navLinks('secondaryNav', 'The right-hand column of the open menu.'),
    bookingCta('Header'),
  ],
}
