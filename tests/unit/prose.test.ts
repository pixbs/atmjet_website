import { describe, expect, it } from 'vitest'

import { plainText } from '@/lib/text'
import { prose } from '../../scripts/seed/prose'

/**
 * The legacy strings as the editor holds them (issue #72, E4.13). `messages/*` kept the layout
 * inside the value — a `\n` where the answer broke a line (`docs/legacy-inventory.md` section
 * 11.2) — and the migration splits it once so that nothing downstream parses a string.
 *
 * The fixtures are the legacy answers themselves, in the two shapes section 11.2 lists: one
 * line, and a sentence with a list under it.
 */
const ONE_LINE = 'Fill out the booking form and then the personal manager will call you back.'

const A_LIST =
  'The cost of a private jet is calculated taking into account such factors as:\n' +
  '- Class, type of aircraft\n' +
  '- Flight range\n' +
  '- Number of passengers'

describe('prose', () => {
  it('holds a legacy string as one paragraph', () => {
    const [paragraph, ...rest] = prose(ONE_LINE).root.children

    expect(rest).toEqual([])
    expect(paragraph?.type).toBe('paragraph')
  })

  it('keeps every line of a list, with a break between one line and the next', () => {
    const [paragraph] = prose(A_LIST).root.children
    const children = (paragraph?.children ?? []) as { type: string; text?: string }[]

    // Four lines and the three breaks between them, in the order they were written.
    expect(children.map((node) => node.type)).toEqual([
      'text',
      'linebreak',
      'text',
      'linebreak',
      'text',
      'linebreak',
      'text',
    ])
    expect(children.filter((node) => node.type === 'text').map((node) => node.text)).toEqual(
      A_LIST.split('\n'),
    )
  })

  it('reads back as the string it was written from', () => {
    // What the structured data of a search result carries (issue #173), so the round trip is
    // the contract: nothing of the legacy answer is lost between the catalogue and the markup.
    expect(plainText(prose(A_LIST))).toBe(A_LIST)
    expect(plainText(prose(ONE_LINE))).toBe(ONE_LINE)
  })
})
