import type { Transition, Variants } from 'motion/react'

/**
 * Shared animation vocabulary (docs/adr/0006-styling-and-motion.md, issue #50).
 *
 * Every value here is measured from the legacy site (docs/legacy-inventory.md sections 10.4
 * and 10.5), so a ported component names the animation instead of repeating numbers:
 *   - the `tailwindcss-animate` classes (`animate-in fade-in slide-in-from-top-10 spin-in`)
 *     with their effective timings, including the ones where `duration-600` was not a real
 *     class and the animation therefore ran at the 150 ms default;
 *   - the `framer-motion` reveals, the dialog and accordion transitions and the counter.
 * Transitions that left the easing unset keep it unset here, so the library default the
 * legacy site rendered with still applies.
 *
 * The intro at the end is the exception: the owner asked for a new one, so its values are
 * chosen rather than measured (docs/legacy-inventory.md section 13, entry 101).
 */

/** Durations in seconds, named after the legacy animation each one belongs to. */
export const duration = {
  /** tailwindcss-animate default: burger and close icons, navbar, footer and dialog children. */
  enter: 0.15,
  /** Cookie banner, cookie modal and booking dialog (`duration-300`). */
  dialog: 0.3,
  /** FAQ accordion content height. */
  accordion: 0.4,
  /** Card reveals on scroll, and the counter fading in. */
  reveal: 0.5,
  /** Hero headlines (`duration-1000`). */
  hero: 1,
  /** The line separator drawing itself. */
  line: 1,
  /** Counter: how long the numbers take to reach their target. */
  count: 0.8,
} as const

/** How far each legacy animation travelled, in pixels (degrees for `spin`). */
export const offset = {
  /** `slide-in-from-top-10` (2.5rem). */
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

/**
 * The intro: the curtain over the home page opening onto its hero, which rises into place
 * behind it. Everything ends exactly where the legacy drew it; only the arrival is new.
 */
export const intro = {
  easing: {
    /** Fast off the mark and a long settle: everything that arrives. */
    out: [0.16, 1, 0.3, 1],
    /** Its mirror, for the wordmark leaving. */
    in: [0.7, 0, 0.84, 0],
    /** Slow, fast, slow: the window growing to the screen. */
    window: [0.76, 0, 0.24, 1],
  },
  duration: {
    /** A word rising into its line. */
    rise: 1.1,
    /** The wordmark's whole pass: in, a hold, out. */
    logo: 1.9,
    /** The window in the curtain, from a point to the screen. */
    curtain: 1.6,
    /** The hero picture settling to its size. */
    settle: 1.8,
  },
  delay: {
    logo: 0.1,
    /** The window opens behind the wordmark, before it leaves. */
    curtain: 1.15,
    /** From the moment the window starts to grow: the overline, the heading, the signature. */
    overline: 0.35,
    heading: 0.45,
    signature: 0.9,
    /** And the chrome after them: the header dropping in, then the floating button. */
    header: 0.9,
    corner: 1.3,
    /** Between one word of a line and the next. */
    word: 0.07,
  },
  /** Share of the curtain's run spent opening to a cabin window, after which the hero starts. */
  cabin: 0.375,
  /** The hero picture's scale before it settles. */
  zoom: 1.15,
  /** How far the hero picture lags behind the page as the hero scrolls away. */
  parallax: '30%',
  /** How far, in pixels, the hero's words drift ahead of the page as it scrolls away. */
  drift: 160,
} as const

/**
 * Where a masked word stands: under its line, in it, over it. The clip moves against the
 * travel, so the word is only ever seen inside its own line, widened for accents and descenders.
 */
const line = {
  under: { y: '180%', clipPath: 'inset(-220% -0.2em 140% -0.2em)' },
  in: { y: '0%', clipPath: 'inset(-40% -0.2em -40% -0.2em)' },
  over: { y: '-180%', clipPath: 'inset(140% -0.2em -220% -0.2em)' },
}

/**
 * A word rising into its line: put under it at once while it is out of sight, then risen. The
 * hero's words and every section heading arrive this way.
 */
export const riseWord: Variants = {
  hidden: { ...line.under, transition: { duration: 0 } },
  visible: (wait: number = 0) => ({
    ...line.in,
    transition: { duration: intro.duration.rise, ease: intro.easing.out, delay: wait },
    transitionEnd: { clipPath: 'none' },
  }),
}

/*
 * How the sections arrive as they scroll into view, in the intro's language. Each starts
 * `hidden` at once, out of sight, and `custom` is how long it waits before arriving.
 */

/** Words that are not a heading, and anything else that rises a little as it fades in. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32, transition: { duration: 0 } },
  visible: (wait: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: intro.easing.out, delay: wait },
  }),
}

/** A fade alone, for a box whose gradient is pinned to the screen and would jump if it moved. */
export const fadeIn: Variants = {
  hidden: { opacity: 0, transition: { duration: 0 } },
  visible: (wait: number = 0) => ({
    opacity: 1,
    transition: { duration: 1.2, ease: intro.easing.out, delay: wait },
  }),
}

/** A photograph or a card uncovered from its foot up, like a blind going up. */
export const unveil: Variants = {
  hidden: { clipPath: 'inset(100% 0% 0% 0%)', transition: { duration: 0 } },
  visible: (wait: number = 0) => ({
    clipPath: 'inset(0% 0% 0% 0%)',
    transition: { duration: 1.2, ease: intro.easing.out, delay: wait },
    transitionEnd: { clipPath: 'none' },
  }),
}

/**
 * A gold heading drawn from left to right. Its gradient is clipped to the letters, which split
 * words would lose, so the line is uncovered whole and never moved.
 */
export const gild: Variants = {
  hidden: { clipPath: 'inset(-25% 100% -25% 0%)', transition: { duration: 0 } },
  visible: (wait: number = 0) => ({
    clipPath: 'inset(-25% 0% -25% 0%)',
    transition: { duration: 1.4, ease: intro.easing.out, delay: wait },
    transitionEnd: { clipPath: 'none' },
  }),
}

/**
 * A photograph filling a card: uncovered from its foot up while it settles from large, and
 * leaning in under the pointer. Coming back from the pointer it waits again, so only a
 * photograph that never leans in is given a wait.
 */
export const settle: Variants = {
  hidden: { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.2, transition: { duration: 0 } },
  visible: (wait: number = 0) => ({
    clipPath: 'inset(0% 0% 0% 0%)',
    scale: 1,
    transition: {
      clipPath: { duration: 1.2, ease: intro.easing.out, delay: wait },
      scale: { duration: 1.6, ease: intro.easing.out, delay: wait },
    },
    transitionEnd: { clipPath: 'none' },
  }),
  hover: { scale: 1.05, transition: { duration: 0.9, ease: intro.easing.out } },
}

/** The header after the intro: held above its place while the curtain is down, then dropped in. */
export const dropIn: Variants = {
  hidden: { opacity: 0, y: -24, transition: { duration: 0 } },
  visible: (wait: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: intro.easing.out, delay: wait },
  }),
}

/** The floating button after the intro: held small while the curtain is down, then grown in. */
export const growIn: Variants = {
  hidden: { opacity: 0, scale: 0.6, transition: { duration: 0 } },
  visible: (wait: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.9, ease: intro.easing.out, delay: wait },
  }),
}

/** The menu over the whole screen: fades in, and its lines rise one after another. */
export const menuOverlay: Variants = {
  hidden: { opacity: 0, transition: { duration: 0.3, ease: intro.easing.in } },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: intro.easing.out,
      delayChildren: 0.12,
      staggerChildren: 0.05,
    },
  },
}

/** The floating button's panel: grows from the corner it opens out of, its lines rising in turn. */
export const menuPanel: Variants = {
  hidden: { opacity: 0, scale: 0.94, transition: { duration: 0.25, ease: intro.easing.in } },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: intro.easing.out,
      delayChildren: 0.08,
      staggerChildren: 0.05,
    },
  },
}

/** One line of a menu, rising into place as the menu opens. */
export const menuLine: Variants = {
  hidden: { ...line.under, transition: { duration: 0.25, ease: intro.easing.in } },
  visible: {
    ...line.in,
    transition: { duration: 0.9, ease: intro.easing.out },
    transitionEnd: { clipPath: 'none' },
  },
}

/** A menu link under the pointer: nudged towards where it leads. */
export const nudge = { x: 10, transition: { duration: 0.6, ease: intro.easing.out } } as const

/** The hero picture: held large while the curtain is down, settling as it opens. */
export const introBackdrop: Variants = {
  hidden: { scale: intro.zoom, transition: { duration: 0 } },
  visible: { scale: 1, transition: { duration: intro.duration.settle, ease: intro.easing.out } },
}

/** The wordmark on the curtain: rises into its line, holds, rises out of it. */
export const preloaderLogo: Variants = {
  hidden: line.under,
  visible: {
    y: [line.under.y, line.in.y, line.in.y, line.over.y],
    clipPath: [line.under.clipPath, line.in.clipPath, line.in.clipPath, line.over.clipPath],
    transition: {
      duration: intro.duration.logo,
      delay: intro.delay.logo,
      times: [0, 0.47, 0.71, 1],
      ease: [intro.easing.out, 'linear', intro.easing.in],
    },
  },
  static: { y: '0%', clipPath: 'none' },
}

/**
 * The window in the curtain: opens to a cabin window, then grows to the screen. A custom
 * property rather than the clip path itself, because the path is drawn in pixels of the screen.
 */
export const curtainWindow = {
  '--window': [0, intro.cabin, 1],
  transition: {
    duration: intro.duration.curtain,
    delay: intro.delay.curtain,
    times: [0, intro.cabin, 1],
    ease: [intro.easing.out, intro.easing.window],
  },
}
