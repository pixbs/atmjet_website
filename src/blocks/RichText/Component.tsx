import { type JSXConvertersFunction, RichText as Lexical } from '@payloadcms/richtext-lexical/react'

import type { RichTextBlock } from '@/payload-types'

/**
 * A page of text under its heading (issue #57): the privacy policy the legacy cookie banner
 * linked to, which answered 404 there (`docs/legacy-inventory.md` section 13, entry 71).
 *
 * The heading sits where the subpage hero puts its own, below the fixed header. The parity base
 * layer sizes `h2` for a section title and gives a list no marker, so the converters draw the
 * editor's headings a step smaller and its lists with their bullets and numbers.
 */
export interface RichTextProps {
  title: string
  content: RichTextBlock['content']
}

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  heading: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children })

    return node.tag === 'h3' ? (
      <h3 className="text-xl lg:text-2xl">{children}</h3>
    ) : (
      <h2 className="pt-6 text-2xl lg:text-3xl">{children}</h2>
    )
  },
  list: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children })

    return node.tag === 'ol' ? (
      <ol className="list-decimal space-y-2 pl-6">{children}</ol>
    ) : (
      <ul className="list-disc space-y-2 pl-6">{children}</ul>
    )
  },
  link: ({ node, nodesToJSX }) => (
    <a
      className="text-white underline"
      href={node.fields.url ?? ''}
      {...(node.fields.newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
    >
      {nodesToJSX({ nodes: node.children })}
    </a>
  ),
})

export function RichText({ title, content }: RichTextProps) {
  return (
    <section data-section="rich-text">
      <div className="container gap-12 pt-32">
        <h1>{title}</h1>
        <Lexical className="max-w-screen-md gap-4" converters={converters} data={content} />
      </div>
    </section>
  )
}
