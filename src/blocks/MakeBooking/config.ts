import type { Block } from 'payload'

/**
 * The booking invitation (issue #115, `docs/legacy-inventory.md` section 5): a heading over the
 * flight request form, drawn plainly or inside a card.
 *
 * The legacy section took one boolean, `isCard`, and read its heading from `form.title`; here
 * the heading is the editor's and the two looks are named rather than true and false.
 */
export const makeBooking: Block = {
  slug: 'makeBooking',
  interfaceName: 'MakeBookingBlock',
  labels: { singular: 'Make a booking', plural: 'Booking invitations' },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'variant',
      type: 'select',
      required: true,
      defaultValue: 'plain',
      options: [
        { value: 'plain', label: 'Plain' },
        { value: 'card', label: 'Card' },
      ],
      admin: { description: 'The card is what the legacy `isCard` drew: a panel around it.' },
    },
  ],
}
