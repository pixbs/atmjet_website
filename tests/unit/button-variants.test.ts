import { describe, expect, it } from 'vitest'

import { buttonVariants } from '@/components/ui/button'

/**
 * The variants must emit the legacy class names, because the parity base layer is what styles
 * them (issue #49): a renamed or dropped class would silently change every button on the site.
 */
describe('button variants', () => {
  it('renders the plain pill with no extra class', () => {
    expect(buttonVariants()).toBe('')
  })

  it.each([
    ['big', { size: 'big' } as const, 'big'],
    ['middle', { size: 'middle' } as const, 'middle'],
    ['gold', { tone: 'gold' } as const, 'bg-gold'],
  ])('renders %s', (_name, options, expected) => {
    expect(buttonVariants(options).split(' ').filter(Boolean)).toEqual([expected])
  })

  it('adds the outline only where the legacy site styled it, on the middle button', () => {
    expect(buttonVariants({ size: 'middle', tone: 'dark' }).split(' ').filter(Boolean)).toEqual([
      'middle',
      'dark',
    ])
    expect(buttonVariants({ tone: 'dark' })).toBe('')
  })

  it('combines a size with the gold gradient, as the legacy call to action did', () => {
    const classes = buttonVariants({ size: 'big', tone: 'gold' }).split(' ').filter(Boolean)

    expect(classes).toEqual(expect.arrayContaining(['big', 'bg-gold']))
  })
})
