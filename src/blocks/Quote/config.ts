import type { Block } from 'payload'

/**
 * A quotation on a card, as the citizens page shows two (issue #132,
 * `docs/legacy-inventory.md` section 4): the press one under the Forbes wordmark and the
 * founder's under the company's own. The legacy hard-coded which logo each drew, and wrote the
 * founder's words into the page in Russian only.
 */
export const quote: Block = {
  slug: 'quote',
  interfaceName: 'QuoteBlock',
  labels: { singular: 'Quote', plural: 'Quotes' },
  fields: [
    {
      name: 'variant',
      type: 'select',
      required: true,
      defaultValue: 'press',
      admin: { description: 'Which wordmark stands over the quotation.' },
      options: [
        { label: 'Press (Forbes)', value: 'press' },
        { label: 'Founder (ATM JET)', value: 'founder' },
      ],
    },
    { name: 'quote', type: 'textarea', required: true, localized: true },
    {
      name: 'attribution',
      type: 'text',
      required: true,
      localized: true,
      // One line, as the legacy card drew it: who said it and what they are, in their own words.
      admin: { description: 'The line under the quotation, painted with the gold gradient.' },
    },
  ],
}
