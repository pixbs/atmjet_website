import { Inter } from 'next/font/google'
import localFont from 'next/font/local'

/**
 * The two faces the site is set in (issue #51, `docs/legacy-inventory.md` section 12.2).
 *
 * The legacy site loaded Inter through `next/font/google` and applied it with a class on the
 * body, and declared the display face with a hand-written `@font-face` pointing at
 * `public/fonts`. Both go through `next/font` here, which self-hosts the files, emits the
 * preload links and reserves the metrics, so a face that arrives late does not move the page.
 *
 * They are exposed as the CSS variables the `@theme` tokens already read
 * (`--font-sans`, `--font-serif` in `globals.css`) rather than as class names, because the
 * tokens are what every component resolves a family through (ADR-0006).
 */

/**
 * The body face. The legacy loaded the latin subset alone, so every Cyrillic page fell back to
 * whatever the system offered; the owner decided on 2026-09-13 to add `cyrillic`, which is a
 * deliberate visible change on Russian pages and the reason their baselines move with this.
 */
export const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  // As the legacy `@font-face` had it: the text is readable while the face is still coming.
  display: 'swap',
  variable: '--font-inter',
})

/**
 * The display face of the headings, licensed for the web and confirmed by the owner (#51).
 *
 * woff2 alone, where the legacy `@font-face` listed woff beside it as a fallback: `next/font`
 * preloads every file it is given rather than letting the browser choose one, so naming both
 * costs every visitor a second copy of the face. Every browser the site supports reads woff2.
 */
export const regresso = localFont({
  src: './fonts/TARegressoPROEasyRegular/font.woff2',
  weight: '400',
  style: 'normal',
  display: 'swap',
  variable: '--font-regresso',
})
