import { describe, expect, it } from 'vitest'

import {
  accordionContent,
  banner,
  cardReveal,
  contactBlock,
  counterReveal,
  dialog,
  duration,
  easing,
  fade,
  heroHeadline,
  inViewOnce,
  inViewRepeat,
  offset,
  overlay,
  spin,
  transition,
} from '@/lib/motion'

/**
 * The vocabulary is the record of how the legacy site animated (issue #50,
 * docs/legacy-inventory.md sections 10.4 and 10.5), so these are the measured numbers.
 */
describe('legacy timings', () => {
  it.each([
    ['tailwindcss-animate default', duration.enter, 0.15],
    ['navbar overlay', duration.overlay, 0.2],
    ['cookie banner, modal and booking dialog', duration.dialog, 0.3],
    ['faq accordion', duration.accordion, 0.4],
    ['card reveals and the counter', duration.reveal, 0.5],
    ['hero headlines', duration.hero, 1],
    ['line separator', duration.line, 1],
    ['counting', duration.count, 0.8],
  ])('%s runs for %ss', (_name, actual, expected) => {
    expect(actual).toBe(expected)
  })

  it.each([
    ['slide-in-from-top-10', offset.slideFromTop, -40],
    ['card reveal', offset.card, -50],
    ['counter', offset.counter, -20],
    ['contact block', offset.contact, -100],
    ['spin-in, in degrees', offset.spin, 30],
  ])('%s travels %spx', (_name, actual, expected) => {
    expect(actual).toBe(expected)
  })

  it('uses the css ease curve for the enter animations and easeOut where it was named', () => {
    expect(easing.enter).toEqual([0.25, 0.1, 0.25, 1])
    expect(easing.out).toBe('easeOut')
  })

  it('leaves the easing unset where the legacy transitions did', () => {
    for (const named of [transition.reveal, transition.accordion, transition.line]) {
      expect(named).not.toHaveProperty('ease')
    }
  })
})

describe('variants', () => {
  it.each([
    ['fade', fade],
    ['spin', spin],
    ['overlay', overlay],
    ['dialog', dialog],
    ['banner', banner],
    ['heroHeadline', heroHeadline],
    ['cardReveal', cardReveal],
    ['counterReveal', counterReveal],
    ['accordionContent', accordionContent],
  ])('%s has a hidden and a visible state', (_name, variants) => {
    expect(variants).toHaveProperty('hidden')
    expect(variants).toHaveProperty('visible')
  })

  it('spins in from 30 degrees and lands straight', () => {
    expect(spin.hidden).toMatchObject({ opacity: 0, rotate: offset.spin })
    expect(spin.visible).toMatchObject({ opacity: 1, rotate: 0 })
  })

  it('gives the dialog and the banner an exit state, for AnimatePresence', () => {
    expect(dialog).toHaveProperty('exit')
    expect(banner).toHaveProperty('exit')
  })

  it('opens the accordion to its content height', () => {
    expect(accordionContent.hidden).toMatchObject({ height: 0 })
    expect(accordionContent.visible).toMatchObject({ height: 'auto' })
  })

  it('delays a contact block by the value the section gave it', () => {
    expect(contactBlock(0.6).hidden).toMatchObject({ opacity: 0, y: offset.contact })
    expect(contactBlock(0.6).visible).toMatchObject({
      transition: { duration: duration.reveal, ease: easing.out, delay: 0.6 },
    })
  })
})

describe('viewport options', () => {
  it('runs the tiles and contact blocks once, at half visibility', () => {
    expect(inViewOnce).toEqual({ once: true, amount: 0.5 })
  })

  it('lets the card reveals and the line run again', () => {
    expect(inViewRepeat).toEqual({ once: false })
  })
})
