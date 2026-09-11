import { describe, expect, it } from 'vitest'

import {
  duration,
  easing,
  fade,
  inView,
  reveal,
  slideFromTop,
  stagger,
  transition,
} from '@/lib/motion'

describe('motion vocabulary', () => {
  it('orders durations from fast to slower', () => {
    expect(duration.fast).toBeLessThan(duration.base)
    expect(duration.base).toBeLessThan(duration.slow)
    expect(duration.slow).toBeLessThan(duration.slower)
  })

  it('defines cubic-bezier easings with four control points', () => {
    for (const curve of Object.values(easing)) {
      expect(curve).toHaveLength(4)
    }
  })

  it('exposes hidden and visible states for every variant', () => {
    for (const variants of [fade, slideFromTop, reveal]) {
      expect(variants).toHaveProperty('hidden')
      expect(variants).toHaveProperty('visible')
    }
  })

  it('uses the shared transitions inside variants', () => {
    expect(fade.visible).toMatchObject({ transition: transition.base })
    expect(reveal.visible).toMatchObject({ transition: transition.slow })
  })

  it('builds staggered parent variants with a configurable delay', () => {
    expect(stagger()).toMatchObject({ visible: { transition: { staggerChildren: 0.1 } } })
    expect(stagger(0.25)).toMatchObject({ visible: { transition: { staggerChildren: 0.25 } } })
  })

  it('animates scroll reveals once, at half visibility', () => {
    expect(inView).toEqual({ once: true, amount: 0.5 })
  })
})
