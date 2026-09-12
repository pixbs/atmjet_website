import type { Transition, Variants } from 'motion/react'

/**
 * Shared animation vocabulary (docs/adr/0006-styling-and-motion.md, issue #50).
 *
 * Every value here is measured from the legacy site (docs/legacy-inventory.md sections 10.4
 * and 10.5), so a ported component names the animation instead of repeating numbers:
 *   - the `tailwindcss-animate` classes (`animate-in fade-in slide-in-from-top-10 spin-in`)
 *     with their effective timings, including the ones where `duration-600` was not a real
 *     class and the animation therefore ran at the 150 ms default;
 *   - the `framer-motion` reveals, the dialog and accordion transitions, the preloader
 *     keyframes and the counter.
 * Transitions that left the easing unset keep it unset here, so the library default the
 * legacy site rendered with still applies.
 */

/** Durations in seconds, named after the legacy animation each one belongs to. */
export const duration = {
  /** tailwindcss-animate default: burger and close icons, navbar, footer and dialog children. */
  enter: 0.15,
  /** Navbar overlay fade (`duration-200`). */
  overlay: 0.2,
  /** Cookie banner, cookie modal and booking dialog (`duration-300`). */
  dialog: 0.3,
  /** FAQ accordion content height. */
  accordion: 0.4,
  /** Tiles scaling in. */
  tile: 0.4,
  /** Card reveals on scroll, and the counter fading in. */
  reveal: 0.5,
  /** Hero headlines (`duration-1000`). */
  hero: 1,
  /** The line separator drawing itself. */
  line: 1,
  /** Preloader: the backdrop fades out after the logo sequence. */
  preloaderBackdrop: 0.5,
  /** Preloader: the whole logo keyframe sequence. */
  preloaderLogo: 4,
  /** Counter: how long the numbers take to reach their target. */
  count: 0.8,
} as const

/** Delays in seconds. */
export const delay = {
  /** The preloader backdrop waits for the logo to leave. */
  preloaderBackdrop: 2,
  /** Multiplied by the tile index to stagger the grid. */
  tile: 0.1,
} as const

/** How far each legacy animation travelled, in pixels (degrees for `spin`). */
export const offset = {
  /** `slide-in-from-top-10` (2.5rem), and the preloader logo. */
  slideFromTop: -40,
  /** Card reveals (`y: -50`). */
  card: -50,
  /** The counter. */
  counter: -20,
  /** The contact blocks. */
  contact: -100,
  /** `spin-in`, in degrees. */
  spin: 30,
} as const

export const easing = {
  /** CSS `ease`: tailwindcss-animate never set a timing function. */
  enter: [0.25, 0.1, 0.25, 1],
  /** Named explicitly by the contact blocks. */
  out: 'easeOut',
} as const

export const transition = {
  enter: { duration: duration.enter, ease: easing.enter },
  overlay: { duration: duration.overlay, ease: easing.enter },
  dialog: { duration: duration.dialog, ease: easing.enter },
  hero: { duration: duration.hero, ease: easing.enter },
  accordion: { duration: duration.accordion },
  reveal: { duration: duration.reveal },
  line: { duration: duration.line },
} as const satisfies Record<string, Transition>

/** Viewport options for reveals that run once (tiles and contact blocks used `triggerOnce`). */
export const inViewOnce = { once: true, amount: 0.5 } as const

/** Viewport options for the reveals that re-run whenever the element comes back (cards, line). */
export const inViewRepeat = { once: false } as const

/** `animate-in fade-in`: navbar, footer and dialog children. */
export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transition.enter },
}

/** `animate-in spin-in`: the burger and close icons. */
export const spin: Variants = {
  hidden: { opacity: 0, rotate: offset.spin },
  visible: { opacity: 1, rotate: 0, transition: transition.enter },
}

/** The navbar overlay. */
export const overlay: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transition.overlay },
}

/** Cookie modal and booking dialog. */
export const dialog: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transition.dialog },
  exit: { opacity: 0, transition: transition.dialog },
}

/** The cookie banner: fade and slide from the top at the dialog duration. */
export const banner: Variants = {
  hidden: { opacity: 0, y: offset.slideFromTop },
  visible: { opacity: 1, y: 0, transition: transition.dialog },
  exit: { opacity: 0, transition: transition.dialog },
}

/** Hero headlines: the same movement over a second. */
export const heroHeadline: Variants = {
  hidden: { opacity: 0, y: offset.slideFromTop },
  visible: { opacity: 1, y: 0, transition: transition.hero },
}

/** Cards revealed on scroll (why us, empty legs, yachts, advantages). */
export const cardReveal: Variants = {
  hidden: { opacity: 0, y: offset.card },
  visible: { opacity: 1, y: 0, transition: transition.reveal },
}

/** Reveals that only fade (key features). */
export const fadeReveal: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transition.reveal },
}

/** The counter fading in before it counts. */
export const counterReveal: Variants = {
  hidden: { opacity: 0, y: offset.counter },
  visible: { opacity: 1, y: 0, transition: transition.reveal },
}

/** FAQ accordion content; `height: auto` needs `AnimatePresence` with `initial={false}`. */
export const accordionContent: Variants = {
  hidden: { height: 0, transition: transition.accordion },
  visible: { height: 'auto', transition: transition.accordion },
}

/** One tile of the tiles grid: scales in, staggered by its position. */
export function tile(index: number): Variants {
  return {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: duration.tile, delay: index * delay.tile },
    },
  }
}

/** One block of the contact section: each has its own delay. */
export function contactBlock(blockDelay: number): Variants {
  return {
    hidden: { opacity: 0, y: offset.contact },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: duration.reveal, ease: easing.out, delay: blockDelay },
    },
  }
}

/** Preloader backdrop: stays until the logo sequence is over, then fades and collapses. */
export const preloaderBackdrop: Variants = {
  hidden: { opacity: 1, height: '100%', display: 'flex' },
  visible: {
    opacity: 0,
    height: '0%',
    display: 'none',
    transition: { duration: duration.preloaderBackdrop, delay: delay.preloaderBackdrop },
  },
  static: { opacity: 1, height: '100%', display: 'flex' },
}

/** Preloader logo: drops in, holds, leaves upwards, all in one keyframe sequence. */
export const preloaderLogo: Variants = {
  hidden: { opacity: 0, y: offset.slideFromTop },
  visible: {
    opacity: [0, 1, 1, 1, 0, 0],
    y: [offset.slideFromTop, 0, 0, offset.slideFromTop, offset.slideFromTop, offset.slideFromTop],
    display: ['none', 'flex', 'flex', 'flex', 'none', 'none'],
    transition: { duration: duration.preloaderLogo },
  },
  static: { opacity: 1, y: 0, display: 'flex' },
}
