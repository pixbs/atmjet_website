import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'

/**
 * Rich text as one string, for the places that cannot draw it (issue #72, E4.13): the
 * structured data a search result is built from reads an answer as text, not as markup.
 *
 * The converter's own heuristic walks children and takes their `text`, which leaves a line
 * break as nothing at all — and the legacy answers are lists, which a search result would then
 * read as one run-on sentence. So the two nodes that carry the layout say what they are worth:
 * a break is a newline, and a paragraph is a blank line between it and the next.
 */
export type Prose = Parameters<typeof convertLexicalToPlaintext>[0]['data']

export function plainText(prose: Prose): string {
  return convertLexicalToPlaintext({
    data: prose,
    converters: {
      linebreak: () => '\n',
      paragraph: ({ childIndex, node, nodesToPlaintext }) =>
        (childIndex > 0 ? '\n\n' : '') + nodesToPlaintext({ nodes: node.children ?? [] }).join(''),
    },
  })
}
