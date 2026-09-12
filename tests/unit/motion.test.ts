import { describe, expect, it } from 'vitest'

import {
  accordionContent,
  banner,
  cardReveal,
  contactBlock,
  counterReveal,
  delay,
  dialog,
  duration,
  easing,
  fade,
  fadeReveal,
  heroHeadline,
  inViewOnce,
  inViewRepeat,
  offset,
  overlay,
  preloaderBackdrop,
  preloaderLogo,
  spin,
  tile,
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
    ['tiles', duration.tile, 0.4],
    ['card reveals and the counter', duration.reveal, 0.5],
    ['hero headlines', duration.hero, 1],
    ['line separator', duration.line, 1],
    ['preloader backdrop', duration.preloaderBackdrop, 0.5],
    ['preloader logo', duration.preloaderLogo, 4],
    ['counting', duration.count, 0.8],
  ])('%s runs for %ss', (_name, actual, expected) => {
    expect(actual).toBe(expected)
  })

  it('keeps the preloader backdrop waiting for the logo', () => {
    expect(delay.preloaderBackdrop).toBe(2)
    expect(delay.preloaderBackdrop).toBeLessThan(duration.preloaderLogo)
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
    ['fadeReveal', fadeReveal],
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

  it('scales a tile in and staggers it by its position', () => {
    expect(tile(0).hidden).toMatchObject({ opacity: 0, scale: 0 })
    expect(tile(0).visible).toMatchObject({
      scale: 1,
      transition: { duration: duration.tile, delay: 0 },
    })
    expect(tile(3).visible).toMatchObject({ transition: { delay: 3 * delay.tile } })
  })

  it('delays a contact block by the value the section gave it', () => {
    expect(contactBlock(0.6).hidden).toMatchObject({ opacity: 0, y: offset.contact })
    expect(contactBlock(0.6).visible).toMatchObject({
      transition: { duration: duration.reveal, ease: easing.out, delay: 0.6 },
    })
  })

  it('runs the preloader logo as one keyframe sequence and keeps a static state', () => {
    expect(preloaderLogo.visible).toMatchObject({
      opacity: [0, 1, 1, 1, 0, 0],
      transition: { duration: duration.preloaderLogo },
    })
    expect(preloaderLogo.static).toMatchObject({ opacity: 1, y: 0 })
    expect(preloaderBackdrop.static).toMatchObject({ opacity: 1, height: '100%' })
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
