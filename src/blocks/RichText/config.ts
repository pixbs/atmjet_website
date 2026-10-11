import {
  BoldFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  UnorderedListFeature,
} from '@payloadcms/richtext-lexical'
import type { Block } from 'payload'

/**
 * A heading over a run of text an editor writes (issue #57): the privacy policy the legacy
 * cookie banner linked to and never had (`docs/legacy-inventory.md` sections 3.7 and 13).
 *
 * The toolbar holds what a legal text needs and the component can draw: section headings,
 * lists, bold and links to an address, so nothing an editor reaches for renders unstyled.
 */
export const richText: Block = {
  slug: 'richText',
  interfaceName: 'RichTextBlock',
  labels: { singular: 'Rich text', plural: 'Rich texts' },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'content',
      type: 'richText',
      required: true,
      localized: true,
      editor: lexicalEditor({
        features: () => [
          ParagraphFeature(),
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
          BoldFeature(),
          UnorderedListFeature(),
          OrderedListFeature(),
          // Addresses only: a link to a document would need a resolver nothing here calls for.
          LinkFeature({ enabledCollections: [] }),
          InlineToolbarFeature(),
        ],
      }),
      admin: { description: 'Section headings, lists, bold text and links; the title is the h1.' },
    },
  ],
}
