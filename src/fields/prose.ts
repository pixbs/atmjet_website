import { lexicalEditor, ParagraphFeature } from '@payloadcms/richtext-lexical'
import type { RichTextField } from 'payload'

/**
 * Text an editor writes in paragraphs and line breaks (issue #72, E4.13). The legacy kept the
 * layout inside the string — `\n` for a break, `' \n'` for a paragraph
 * (`docs/legacy-inventory.md` section 11.2) — and the decision of 2026-09-13 puts it in the
 * editor instead, so this is rich text with nothing in its toolbar but the paragraph: what the
 * legacy strings carried, and nothing an editor could reach for that the section cannot draw.
 */
export function prose(name: string, description: string): RichTextField {
  return {
    name,
    type: 'richText',
    required: true,
    localized: true,
    editor: lexicalEditor({ features: () => [ParagraphFeature()] }),
    admin: { description },
  }
}
