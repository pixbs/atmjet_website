# ADR-0006: Tailwind discipline and `motion` as the only animation library

Status: accepted (2026-09-11)

## Context

The legacy site used Tailwind 3 with an inverted gray ramp, a gold gradient, global element rules (`div { display: flex; flex-direction: column }`, `section`, `button`, `input`, `a`, `h1`–`h4`), `tailwindcss-animate` classes, `framer-motion`, `react-intersection-observer`, hand-rolled keyframes and arbitrary colour values. The rewrite must reproduce the look exactly while staying clean, scalable and readable.

## Decision

### Tailwind v4

- CSS-first configuration: all design tokens live in `@theme` in `src/app/(frontend)/globals.css`. The legacy palette, gradients, fonts, radii, breakpoints, stacking order and one-off geometry are mapped 1:1 into tokens; the map is recorded below and covered by `tests/unit/theme-tokens.test.ts`. The Tailwind defaults the project does not use are cleared (`--color-*: initial`, `--radius-*: initial`, `--breakpoint-*: initial`), so a legacy class this theme does not define fails the lint rule instead of silently rendering another value.
- **No arbitrary values** in class names; add a token instead. The lint rule warns on them so that exceptions are visible in review.
- Variants with `class-variance-authority`, merging with `cn()` (`clsx` + `tailwind-merge`). Repeated class bundles become components, not `@apply`. `docs/conventions/components.md` is the working guide: folder layout, the server and client split, props, and the rule that a component reproducing a legacy global rule reuses the parity class instead of repeating its declarations.
- `@apply`, `@layer base` and element selectors are allowed only in the documented **parity base layer** in `globals.css`, which reproduces the legacy global element rules verbatim. Nothing else styles elements globally.
- Tailwind is imported only by the frontend layout, so preflight and utilities never reach the Payload admin.
- Mobile-first responsive classes; classes sorted by `prettier-plugin-tailwindcss`; `eslint-plugin-better-tailwindcss` rejects unknown, conflicting, duplicate and deprecated classes.

### Motion

- `motion` (`motion/react`) is the only animation library. `MotionProvider` wraps the frontend with `LazyMotion` (strict, `domAnimation`) and `MotionConfig reducedMotion="user"`; components use `m.*`.
- `src/lib/motion.ts` holds the shared vocabulary, measured from the legacy site (E3.4, issue #50): `duration` (0.15s for the `tailwindcss-animate` default, 0.2s overlay, 0.3s dialog, 0.4s accordion and tiles, 0.5s reveals, 1s heroes and the line, 0.5s/4s preloader, 0.8s counting), `delay`, `offset` (-40px slide, -50px card reveal, -20px counter, -100px contact block, 30deg spin), `easing` (CSS `ease` for the class-based enters, `easeOut` where a component named it) and one variant per legacy animation. A transition the legacy site left without an easing keeps it unset, so the library default still applies.
- Reveals use `whileInView` with `inViewRepeat` (the legacy cards replayed) or `inViewOnce` (`triggerOnce` with a 0.5 threshold, as the tiles and contact blocks used); `react-intersection-observer` is gone.
- Primitives in `src/components/motion`: `Reveal` (scroll reveal wrapper), `Line` (the separator drawing itself over a second) and `Counter`, whose counting logic lives in `src/lib/count-up.ts` (the legacy 30ms steps over 800ms, `toLocaleString` formatting, suffixes kept) and which shows the final label at once under reduced motion, so visual tests stay deterministic.
- `whileInView` replaces `react-intersection-observer`; `AnimatePresence` handles enter and exit of dialogs, menus and accordions. No CSS animation libraries.
- Embla stays for carousels (it is not an animation library).
- Visual tests run with reduced motion so screenshots are deterministic.

## Legacy token map (E3.1, issue #47)

Sources: `legacy/v1:tailwind.config.ts`, `legacy/v1:src/app/[locale]/globals.css`, `docs/legacy-inventory.md` sections 10.1-10.3. `tests/fixtures/legacy-tokens.ts` holds the same values as a fixture.

### Palette

The legacy ramp is inverted (low = dark) and every step is used in every role: text, background, border, stroke, placeholder and gradient stop. Role names (`--color-surface`, `--color-on-surface`) would therefore read wrong in most ported class lists, so the neutrals keep a lightness-ordered scale named `graphite`, positioned like Tailwind's own `neutral`; `850` exists because three near-blacks sit between `800` and `950`.

| Legacy     | Value     | Token          |
| ---------- | --------- | -------------- |
| `gray-900` | `#FFFFFF` | `white`        |
| `gray-800` | `#F0F1F6` | `graphite-100` |
| `gray-700` | `#C0C9CB` | `graphite-300` |
| `gray-600` | `#A2ABAD` | `graphite-400` |
| `gray-500` | `#707070` | `graphite-500` |
| `gray-400` | `#474444` | `graphite-700` |
| `gray-300` | `#2C2C2C` | `graphite-800` |
| `gray-200` | `#1E1E1E` | `graphite-850` |
| `gray-100` | `#1A1A1A` | `graphite-900` |
| `gray-150` | `#171614` | `graphite-950` |

Accents: the four stops of the gold gradient become `gold-600 #DFAB53`, `gold-500 #E6BE6B`, `gold-300 #EFD487`, `gold-400 #EBCA7A` (they are also used flat); the two contact-card gradient ends `to-[#14323D]` and `to-[#0e2a15]` become `teal-950` and `green-950`. The Tailwind 3 defaults live markup relies on are pinned to their v3 hex values, because v4 ships different, oklch-based colours: `red-50 #fef2f2`, `red-500 #ef4444`, `orange-200 #fed7aa`, `blue-600 #2563eb`, `neutral-900 #171717`, plus `black` and `white`. A colour that only a dead component used (`green-300`, `red-300`, `red-400`) is added when and if E6.23 decides to port it.

### Gradient, fonts, radii

- `--background-image-gold` is the legacy `backgroundImage.gold` string verbatim (two stacked gradients, 22 stops) and keeps its utility name `bg-gold`, including `bg-gold bg-clip-text text-transparent` for gold text.
- `--font-sans: var(--font-inter, Inter), sans-serif` and `--font-serif: var(--font-regresso, TARegressoPROEasyRegular), serif` are the legacy stacks; E3.5 supplies the two variables through `next/font`, and until then the fallback inside `var()` keeps today's behaviour. There is no `--font-display`: the legacy class is `font-serif`.
- Radii need care, because two shifts meet. The legacy config pointed `rounded-sm`, `rounded-md` and `rounded-lg` at an undefined `--radius`, so all three rendered **square corners** on the live site; and Tailwind 4 renamed the scale, so the legacy `rounded` (0.25rem) is `rounded-sm` here.

| Legacy class                             | Rendered on the legacy site | Port to         |
| ---------------------------------------- | --------------------------- | --------------- |
| `rounded`                                | 0.25rem                     | `rounded-sm`    |
| `rounded-sm`, `rounded-md`, `rounded-lg` | no radius                   | no radius class |
| `rounded-xl` / `2xl` / `3xl`             | 0.75 / 1 / 1.5rem           | unchanged       |
| `rounded-full`                           | pill                        | unchanged       |

`--radius-md`, `--radius-lg` and the deprecated bare `--radius` stay undefined, so a class copied from the legacy markup fails lint rather than gaining a corner.

### Breakpoints, stacking order, geometry

- Breakpoints keep the legacy pixel values (`sm 640`, `md 768`, `lg 1024`, `xl 1280`, `2xl 1536`). Tailwind 4 defaults to rem, which would move every breakpoint with the root font size; the legacy root is 14px below `lg`. `max-w-screen-md` and `max-w-screen-xl` therefore stay exact.
- Stacking order replaces the legacy arbitrary z-index values: `z-cookie-banner` (900), `z-cookie-modal` (901), `z-preloader-backdrop` (998), `z-preloader` (999), `z-dropdown` (999). The plain steps the legacy markup uses (`z-0` to `z-50`, `-z-10`, `-z-20`, `-z-50`) stay bare numbers, and `-z-[1]` becomes `-z-1`.
- One-off geometry becomes tokens: `gap-seam`/`mt-seam` (2px), `-mb-hero-overlap` (80px), `h-hero-band` (40vh), `top-hero-band` (20vh), `h-hero-basic` (80svh), `w-preloader-logo` (60vw), `aspect-portrait` (3/4), `aspect-banner` (3/1), `aspect-panorama` (17/5), `shadow-dropdown` (`0 6px 20px rgba(0,0,0,0.08)`). `h-[1px]`/`w-[1px]` become the native `h-px`/`w-px`, and `min-h-[680]` is dropped: it was invalid and did nothing.

### Parity base layer (E3.2, issue #48)

The legacy stylesheet was unlayered, so plain specificity decided everything: its element rules lost to utility classes, while its class rules came after `@tailwind utilities` and won on source order. That is why the legacy markup carries `!my-0` on containers, and why `.card border-0` still shows a border there. Tailwind 4 emits real cascade layers, so the split is reproduced deliberately:

| Legacy rule                                                                                                                                | Where it lives now          | Effect                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------- | ------------------------------------------------------------------------------------------------------ |
| `:root`, `div`, `section`, `button`, `input`, `a`, `h1`-`h4`, `hr`                                                                         | `@layer base`               | utility classes win, as on the legacy site                                                             |
| `.button`, `button.big`, `button.middle(.dark)`, `input.dark`, `.container`, `.card`, `.darkening`, `.hero-darkening`, `.option-darkening` | unlayered, after the layers | they win over utilities, as on the legacy site (an important utility such as `my-0!` still beats them) |
| `.no-scrollbar`                                                                                                                            | `@utility`                  | a utility there too                                                                                    |

Three Tailwind 3 preflight defaults are restored in the same layer, because the legacy site rendered with them and Tailwind 4 changed them: the default border colour (`gray-200`, now `graphite-850`), the placeholder colour (`gray-400`, now `graphite-700`) and `cursor: pointer` on buttons (with `cursor: default` on disabled elements).

Kept quirks: buttons with `.middle` and every `input` have **square** corners, because the legacy `rounded-lg`/`rounded-sm` pointed at an undefined variable. Not ported: the legacy `body` rule (it referenced three variables that never existed, so it did nothing), the `.react-tel-input` overrides (the library is unused, E6.21), `.text-balance` and `* { margin: 0 }` (native in Tailwind 4), and the `@font-face` block (E3.5 loads the font through `next/font`).

`src/app/(frontend)/styleguide` renders every rule of the layer as a fixture page; it is unlinked and not indexed, and `tests/visual/styleguide.visual.spec.ts` pins it.

### Other porting notes

- `placeholder-gray-400` becomes `placeholder:text-graphite-700` (Tailwind 4 dropped the `placeholder-*` colour utilities).
- `bg-gradient-to-*` becomes `bg-linear-to-*`, and `outline-none` becomes `outline-hidden`.
- `text-balance` and `no-scrollbar` are native in Tailwind 4 and need no utility of their own; the rest of the legacy `globals.css` (element rules, `.container`, `.card`, the three darkening gradients) is the parity base layer in E3.2, together with the preflight differences (border colour, placeholder colour, `button { cursor: pointer }`).

## Consequences

- Design tokens and the parity base layer are ported in dedicated issues before any section.
- A class such as `bg-[#14323d]` fails review; the token it needs is added once.
- A legacy class list cannot be pasted unchanged: the map above says what each class becomes, and `bun run lint` rejects the names this theme does not define.
