import type { Block } from 'payload'

/**
 * The wordmark beside a sentence (issue #149, `docs/legacy-inventory.md` section 4): the card
 * the citizens page sets under its hero, the company's own mark on one side of a rule and what
 * it says for itself on the other. The legacy read the sentence from the hero's translation key.
 */
export const wordmarkNote: Block = {
  slug: 'wordmarkNote',
  interfaceName: 'WordmarkNoteBlock',
  labels: { singular: 'Wordmark note', plural: 'Wordmark notes' },
  fields: [
    {
      name: 'note',
      type: 'textarea',
      required: true,
      localized: true,
      admin: { description: 'What stands beside the wordmark, across the rule from it.' },
    },
  ],
}
