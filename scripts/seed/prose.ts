/**
 * The legacy strings as an editor would have typed them (issue #72, E4.13).
 *
 * `messages/*` kept the layout inside the value — `\n` for a line break within an answer
 * (`docs/legacy-inventory.md` section 11.2) — and the fields that hold those strings are rich
 * text now. The migration of E10 splits them once, here, so that nothing downstream has to
 * parse a string to know where a line ends.
 */

/** A node of the stored editor value, as Payload writes it. */
interface ProseNode {
  type: string
  version: number
  [key: string]: unknown
}

/**
 * What a `richText` field holds, in the shape `src/payload-types.ts` describes. `src/lib/text.ts`
 * names the same value as the editor's own type, which is narrower than what a fixture builds.
 */
export interface Prose {
  root: {
    type: string
    children: ProseNode[]
    direction: 'ltr' | 'rtl' | null
    format: ''
    indent: number
    version: number
  }
  [key: string]: unknown
}

const text = (value: string): ProseNode => ({
  type: 'text',
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text: value,
  version: 1,
})

const linebreak: ProseNode = { type: 'linebreak', version: 1 }

/** One paragraph, with every `\n` of the legacy string kept as the break it was drawn as. */
export function prose(value: string): Prose {
  const lines = value.split('\n')

  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: lines.flatMap((line, index) =>
            index === 0 ? [text(line)] : [linebreak, text(line)],
          ),
          direction: 'ltr',
          format: '',
          indent: 0,
          textFormat: 0,
          textStyle: '',
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}
