import { describe, expect, it } from 'vitest'

import { carouselOptions, progressWidth } from '@/lib/carousel'

/**
 * The settings and the progress bar of the carousel (issue #98, `docs/legacy-inventory.md`
 * section 6). The five legacy carousels differed in one option between them, and the bar they
 * drew was written straight into a width.
 */
describe('carouselOptions', () => {
  it('aligns the slides to the start, as all five legacy carousels did', () => {
    expect(carouselOptions()).toEqual({ align: 'start' })
  })

  it('takes the looping the key features, vehicles and yachts carousels asked for', () => {
    expect(carouselOptions({ loop: true })).toEqual({ align: 'start', loop: true })
  })

  it('lets a caller override the alignment rather than only add to it', () => {
    expect(carouselOptions({ align: 'center' })).toEqual({ align: 'center' })
  })
})

describe('progressWidth', () => {
  it('reads the progress as the width of the bar', () => {
    expect(progressWidth(0)).toBe('0%')
    expect(progressWidth(0.5)).toBe('50%')
    expect(progressWidth(1)).toBe('100%')
  })

  it('holds the bar inside its track when a drag is carried past the end', () => {
    // Embla reports progress outside 0 to 1 while the drag is held, and the legacy bar followed
    // it out of the section it belonged to.
    expect(progressWidth(1.4)).toBe('100%')
    expect(progressWidth(-0.2)).toBe('0%')
  })

  it('draws nothing rather than an invalid width when there is no progress to read', () => {
    expect(progressWidth(Number.NaN)).toBe('0%')
  })
})
