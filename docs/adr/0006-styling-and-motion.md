# ADR-0006: Tailwind discipline and `motion` as the only animation library

Status: accepted (2026-09-11)

## Context

The legacy site used Tailwind 3 with an inverted gray ramp, a gold gradient, global element rules (`div { display: flex; flex-direction: column }`, `section`, `button`, `input`, `a`, `h1`–`h4`), `tailwindcss-animate` classes, `framer-motion`, `react-intersection-observer`, hand-rolled keyframes and arbitrary colour values. The rewrite must reproduce the look exactly while staying clean, scalable and readable.

## Decision

### Tailwind v4

- CSS-first configuration: all design tokens live in `@theme` in `src/app/(frontend)/globals.css` with semantic names (`--color-surface`, `--color-gold-*`, `--font-display`, `--radius-card`). The legacy palette, gradients, fonts and radii are mapped 1:1 into tokens.
- **No arbitrary values** in class names; add a token instead. The lint rule warns on them so that exceptions are visible in review.
- Variants with `class-variance-authority`, merging with `cn()` (`clsx` + `tailwind-merge`). Repeated class bundles become components, not `@apply`.
- `@apply`, `@layer base` and element selectors are allowed only in the documented **parity base layer** in `globals.css`, which reproduces the legacy global element rules verbatim. Nothing else styles elements globally.
- Tailwind is imported only by the frontend layout, so preflight and utilities never reach the Payload admin.
- Mobile-first responsive classes; classes sorted by `prettier-plugin-tailwindcss`; `eslint-plugin-better-tailwindcss` rejects unknown, conflicting, duplicate and deprecated classes.

### Motion

- `motion` (`motion/react`) is the only animation library. `MotionProvider` wraps the frontend with `LazyMotion` (strict, `domAnimation`) and `MotionConfig reducedMotion="user"`; components use `m.*`.
- `src/lib/motion.ts` holds the shared vocabulary (durations, easings, `fade`, `slideFromTop`, `reveal`, `stagger`, `inView`). Each legacy animation (`tailwindcss-animate` classes and their timings, `whileInView` reveals, the preloader, counters, the line separator) is mapped onto it.
- `whileInView` replaces `react-intersection-observer`; `AnimatePresence` handles enter and exit of dialogs, menus and accordions. No CSS animation libraries.
- Embla stays for carousels (it is not an animation library).
- Visual tests run with reduced motion so screenshots are deterministic.

## Consequences

- Design tokens and the parity base layer are ported in dedicated issues before any section.
- A class such as `bg-[#14323d]` fails review; the token it needs is added once.
