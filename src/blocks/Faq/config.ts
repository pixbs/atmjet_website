import type { Block } from 'payload'

/**
 * The frequently asked questions (issue #123, `docs/legacy-inventory.md` section 5): the
 * heading beside a list where one answer shows at a time. The legacy read five questions and
 * five answers from ten translation keys, so adding a sixth meant a deploy.
 */
export const faq: Block = {
  slug: 'faq',
  interfaceName: 'FaqBlock',
  labels: { singular: 'FAQ', plural: 'FAQ sections' },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'questions',
      type: 'array',
      minRows: 1,
      labels: { singular: 'Question', plural: 'Questions' },
      admin: {
        description: 'The first one is open when the page arrives, as the legacy list was.',
      },
      fields: [
        { name: 'question', type: 'text', required: true, localized: true },
        {
          name: 'answer',
          type: 'textarea',
          required: true,
          localized: true,
          admin: { description: 'Each line break is kept, which is how the legacy answers read.' },
        },
      ],
    },
  ],
}
