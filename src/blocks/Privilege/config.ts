import type { Block } from 'payload'

/**
 * The privileges section (issue #120, `docs/legacy-inventory.md` section 5): the heading beside
 * a stack of privileges and the invitation to write to the company under them. The home page
 * and the group page ran it off eleven translation keys; it is an editor's section now.
 */
export const privilege: Block = {
  slug: 'privilege',
  interfaceName: 'PrivilegeBlock',
  labels: { singular: 'Privileges', plural: 'Privilege sections' },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'goldTitle',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'The second line of the heading, painted with the gold gradient.' },
    },
    {
      name: 'cards',
      type: 'array',
      minRows: 1,
      labels: { singular: 'Privilege', plural: 'Privileges' },
      fields: [
        {
          name: 'icon',
          type: 'select',
          required: true,
          defaultValue: 'plane',
          // The three the legacy section drew; the icon set is `src/components/icons`.
          options: [
            { label: 'Aircraft', value: 'plane' },
            { label: 'Exchange', value: 'exchange' },
            { label: 'Diamond', value: 'diamond' },
          ],
        },
        { name: 'title', type: 'text', required: true, localized: true },
        { name: 'description', type: 'text', required: true, localized: true },
      ],
    },
    {
      name: 'contact',
      type: 'group',
      admin: {
        description: 'The panel under the stack. Where the buttons lead is in Site settings.',
      },
      fields: [
        { name: 'title', type: 'text', required: true, localized: true },
        { name: 'description', type: 'text', required: true, localized: true },
        { name: 'telegram', type: 'text', required: true, localized: true },
        { name: 'whatsapp', type: 'text', required: true, localized: true },
        {
          name: 'background',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'The pattern behind the panel; it is plain without one.' },
        },
      ],
    },
  ],
}
