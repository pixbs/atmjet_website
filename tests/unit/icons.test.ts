import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import * as icons from '@/components/icons'

/**
 * The ported icon set (issue #109). The legacy site imported 23 SVG files through SVGR
 * (`docs/legacy-inventory.md` section 12.3); these are components, so what they render is
 * pinned here and the sheet on `/styleguide` is compared pixel by pixel by the visual tier.
 */
const ENTRIES = Object.entries(icons)

const render = (Icon: (typeof ENTRIES)[number][1], props = {}) =>
  renderToStaticMarkup(createElement(Icon, props))

describe.each(ENTRIES)('%s', (name, Icon) => {
  it('renders the artwork it was converted from', () => {
    // The snapshot is the parity contract: path data changes only on purpose.
    expect(render(Icon)).toMatchSnapshot()
  })

  it('takes the class the caller gives it, which is how the legacy sized its icons', () => {
    expect(render(Icon, { className: 'size-8' })).toContain('class="size-8"')
  })

  it('sizes itself when a size is asked for', () => {
    expect(render(Icon, { size: 24 })).toContain('width="24" height="24"')
  })
})

/** The six the legacy drew with their own gold gradient; Tailwind's text colour does not reach them. */
const GRADIENT_ICONS = [
  'DiamondGold',
  'PlaneGold',
  'Exchange',
  'BedDouble',
  'SecurityWorker',
  'People',
]

describe('the set', () => {
  it('draws in the current text colour wherever the legacy icon did', () => {
    const ownColour = ENTRIES.filter(([, Icon]) => !render(Icon).includes('currentColor'))

    expect(ownColour.map(([name]) => name)).toEqual(GRADIENT_ICONS)
  })

  it('keeps the intrinsic size of the four legacy files that carried one', () => {
    const intrinsic = ENTRIES.filter(([, Icon]) => /^<svg[^>]*\swidth=/.test(render(Icon)))

    // Every other icon has only a viewBox and scales to its container, which is what the legacy
    // Tailwind size classes relied on. These four are left as they were: taking their width away
    // would change how they render where no class sizes them.
    expect(intrinsic.map(([name]) => name)).toEqual([
      'Exchange',
      'BedDouble',
      'SecurityWorker',
      'People',
    ])
  })

  it('gives every gradient its own id, so two icons on one page cannot share one', () => {
    const ids = ENTRIES.flatMap(([, Icon]) => [...render(Icon).matchAll(/id="([^"]+)"/g)]).map(
      ([, id]) => id,
    )

    // The legacy files all called their gradient "a"; rendered side by side, the second icon
    // would have taken the first one's colours.
    expect(new Set(ids).size).toBe(ids.length)
  })
})
