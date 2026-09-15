import type { Block, Field } from 'payload'

/**
 * The contact section every legacy page ended with (issue #129, `docs/legacy-inventory.md`
 * section 5): two messenger cards, the booking form, and the card holding the address and the
 * telephone number.
 *
 * Only the wording is written here. Where the two cards lead, and what the third one says, come
 * from the site settings the header and the footer already read (issue #61), so a number changes
 * in one place; the legacy section wrote both by hand, in English and Russian ternaries
 * (section 13, and section 10.4).
 */
const card = (name: string, label: string): Field => ({
  name,
  type: 'group',
  label,
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'description', type: 'textarea', required: true, localized: true },
  ],
})

export const contactUs: Block = {
  slug: 'contactUs',
  interfaceName: 'ContactUsBlock',
  labels: { singular: 'Contact us', plural: 'Contact sections' },
  fields: [
    card('telegram', 'Telegram card'),
    card('whatsapp', 'WhatsApp card'),
    {
      name: 'hours',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'The line under the telephone number. The legacy said it was open 24/7.',
      },
    },
    {
      name: 'source',
      type: 'text',
      required: true,
      defaultValue: 'Contact_us',
      admin: {
        position: 'sidebar',
        description:
          'What a lead from this form is traced back to. The legacy inline form sent an empty string, so nothing said which page it came from (section 13, entry 60).',
      },
    },
  ],
}
