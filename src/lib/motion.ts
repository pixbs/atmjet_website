import type { Transition, Variants } from 'motion/react'

/**
 * Shared animation vocabulary (docs/adr/0006-styling-and-motion.md).
 *
 * Every animation on the site is expressed with `motion` and these named
 * durations, easings and variants, so timing stays consistent and visual tests
 * can neutralise motion in one place. E3.4 maps each legacy animation
 * (tailwindcss-animate classes, framer-motion whileInView, the preloader and
 * counters) onto this module.
 */

/** Durations in seconds. */
export const duration = {
  fast: 0.2,
  base: 0.3,
  slow: 0.6,
  slower: 1,
} as const

/** Cubic-bezier easings. */
export const easing = {
  standard: [0.4, 0, 0.2, 1],
  out: [0, 0, 0.2, 1],
  in: [0.4, 0, 1, 1],
} as const satisfies Record<string, [number, number, number, number]>

export const transition = {
  base: { duration: duration.base, ease: easing.standard },
  slow: { duration: duration.slow, ease: easing.out },
} as const satisfies Record<string, Transition>

export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transition.base },
}

export const slideFromTop: Variants = {
  hidden: { opacity: 0, y: -40 },
  visible: { opacity: 1, y: 0, transition: transition.slow },
}

/** Scroll reveal used by cards and sections (replaces react-intersection-observer). */
export const reveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: transition.slow },
}

/** Parent variants that stagger `reveal`/`fade` children. */
export const stagger = (staggerChildren = 0.1): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren } },
})

/** Viewport options for `whileInView`: animate once, when half of the element is visible. */
export const inView = { once: true, amount: 0.5 } as const
