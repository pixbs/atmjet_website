/**
 * The legacy global rules as a fixture (issue #48), from `legacy/v1:src/app/[locale]/globals.css`
 * and docs/legacy-inventory.md section 10.1. `declarations` are checked against the compiled
 * stylesheet, `absent` catches a rule that gained something the legacy site did not have.
 */

export interface ParityRule {
  /** Where the rule comes from on the legacy site. */
  legacy: string
  /** The selector as the parity layer writes it. */
  selector: string
  /** Declarations the compiled rule must contain. */
  declarations: string[]
  /** Declarations the compiled rule must not contain. */
  absent?: string[]
  /**
   * True when Tailwind also generates a utility with this class. Only `.container` does: the
   * legacy stylesheet layered its own rule on top of Tailwind's container, and so does this
   * one, which is where `width: 100%` and the breakpoint max-widths come from.
   */
  alsoAUtility?: boolean
}

/**
 * Element rules. They live in `@layer base`, where utility classes beat them, exactly as
 * plain specificity made them lose on the legacy site.
 */
export const ELEMENT_RULES: ParityRule[] = [
  {
    legacy: ':root { scroll-smooth bg-gray-100 text-sm text-gray-600 lg:text-base }',
    selector: ':root',
    declarations: [
      'scroll-behavior: smooth',
      'background-color: var(--color-graphite-900)',
      'font-size: var(--text-sm)',
      'color: var(--color-graphite-400)',
      'font-size: var(--text-base)',
    ],
  },
  {
    legacy: 'div { flex flex-col }',
    selector: 'div',
    declarations: ['display: flex', 'flex-direction: column'],
  },
  {
    legacy: 'section { relative flex flex-col items-center justify-center }',
    selector: 'section',
    declarations: [
      'position: relative',
      'flex-direction: column',
      'align-items: center',
      'justify-content: center',
    ],
  },
  {
    legacy: 'button { rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-gray-100 }',
    selector: 'button',
    declarations: [
      'border-radius: calc(infinity * 1px)',
      'background-color: var(--color-white)',
      'color: var(--color-graphite-900)',
      'padding-inline: calc(var(--spacing) * 4)',
      'padding-block: calc(var(--spacing) * 2)',
    ],
  },
  {
    legacy: 'input { rounded-sm bg-gray-900 px-4 py-4 text-sm font-normal text-gray-100 }',
    selector: 'input',
    declarations: [
      'background-color: var(--color-white)',
      'color: var(--color-graphite-900)',
      'padding-block: calc(var(--spacing) * 4)',
      'appearance: none',
    ],
    // The legacy rounded-sm pointed at an undefined --radius: square corners.
    absent: ['border-radius'],
  },
  {
    legacy: 'a { py-2 }',
    selector: 'a',
    declarations: ['padding-block: calc(var(--spacing) * 2)'],
  },
  {
    legacy: 'h1,h2,h3,h4 { font-serif text-gray-900 }',
    selector: 'h1, h2, h3, h4',
    declarations: ['font-family: var(--font-serif)', 'color: var(--color-white)'],
  },
  {
    legacy: 'h1 { text-5xl lg:text-6xl }',
    selector: 'h1',
    declarations: ['font-size: var(--text-5xl)', 'font-size: var(--text-6xl)'],
  },
  {
    legacy: 'h2 { text-4xl lg:text-5xl }',
    selector: 'h2',
    declarations: ['font-size: var(--text-4xl)', 'font-size: var(--text-5xl)'],
  },
  {
    legacy: 'h3 { text-2xl lg:text-3xl }',
    selector: 'h3',
    declarations: ['font-size: var(--text-2xl)', 'font-size: var(--text-3xl)'],
  },
  {
    legacy: 'h4 { text-xl lg:text-2xl }',
    selector: 'h4',
    declarations: ['font-size: var(--text-xl)', 'font-size: var(--text-2xl)'],
  },
  {
    legacy: 'hr { border-t border-gray-300 }',
    selector: 'hr',
    declarations: ['border-top-width: 1px', 'border-color: var(--color-graphite-800)'],
  },
]

/** The Tailwind 3 preflight defaults the legacy site rendered with. */
export const PREFLIGHT_RESTORED: ParityRule[] = [
  {
    legacy: 'borderColor.DEFAULT was gray-200, Tailwind 4 uses currentColor',
    selector: '*, ::after, ::before, ::backdrop, ::file-selector-button',
    declarations: ['border-color: var(--color-graphite-850)'],
  },
  {
    legacy: 'placeholders were gray-400',
    selector: '::placeholder',
    declarations: ['color: var(--color-graphite-700)'],
  },
  {
    legacy: 'buttons were a pointer',
    selector: "button, [role='button']",
    declarations: ['cursor: pointer'],
  },
  {
    legacy: 'disabled elements were not',
    selector: ':disabled',
    declarations: ['cursor: default'],
  },
]

/**
 * Class rules. They stay unlayered, because on the legacy site they came after the utilities
 * and won on source order: `.card border-0` keeps the card's border there, and the legacy
 * markup carries `!my-0` to override the container's margin.
 */
export const CLASS_RULES: ParityRule[] = [
  {
    legacy: '.button (second half of `button, .button`)',
    selector: '.button',
    declarations: ['border-radius: calc(infinity * 1px)', 'background-color: var(--color-white)'],
  },
  {
    legacy: 'button.big { rounded-2xl px-8 py-4 text-lg font-normal }',
    selector: 'button.big, .button.big',
    declarations: [
      'border-radius: var(--radius-2xl)',
      'padding-inline: calc(var(--spacing) * 8)',
      'font-size: var(--text-lg)',
    ],
  },
  {
    legacy: 'button.middle { rounded-lg px-6 py-3 text-base font-normal }',
    selector: 'button.middle, .button.middle',
    declarations: ['padding-inline: calc(var(--spacing) * 6)', 'font-size: var(--text-base)'],
    // The legacy rounded-lg pointed at an undefined --radius: square corners.
    absent: ['border-radius'],
  },
  {
    legacy: 'button.middle.dark { border border-gray-900 bg-transparent text-gray-900 }',
    selector: 'button.middle.dark, .button.middle.dark',
    declarations: [
      'border-color: var(--color-white)',
      'background-color: transparent',
      'color: var(--color-white)',
    ],
  },
  {
    legacy: 'input.dark { border-b border-gray-600 bg-transparent text-gray-900 }',
    selector: 'input.dark',
    declarations: [
      'border-bottom-width: 1px',
      'border-color: var(--color-graphite-400)',
      'background-color: transparent',
      'color: var(--color-white)',
    ],
  },
  {
    legacy: '.container { relative my-10 flex max-w-screen-xl flex-col px-6 md:px-10 lg:px-16 }',
    selector: '.container',
    alsoAUtility: true,
    declarations: [
      'position: relative',
      'max-width: var(--breakpoint-xl)',
      'margin-block: calc(var(--spacing) * 10)',
      'padding-inline: calc(var(--spacing) * 6)',
      'padding-inline: calc(var(--spacing) * 10)',
      'padding-inline: calc(var(--spacing) * 16)',
    ],
  },
  {
    legacy: '.card { rounded-3xl border border-gray-400 }',
    selector: '.card',
    declarations: [
      'border-radius: var(--radius-3xl)',
      'border-width: 1px',
      'border-color: var(--color-graphite-700)',
    ],
  },
  {
    legacy: '.darkening: four gradients towards #171614',
    selector: '.darkening',
    declarations: ['rgba(23, 22, 20, 0) 15%', '#171614 81.23%', '270deg', '90deg'],
  },
  {
    legacy: '.hero-darkening: two gradients towards #1a1a1a over rgba(26,26,26,0.7)',
    selector: '.hero-darkening',
    declarations: ['rgba(26, 26, 26, 0) 66.34%', '#1a1a1a 96.56%', 'rgba(26, 26, 26, 0.7)'],
  },
  {
    legacy: '.option-darkening: one 270deg gradient',
    selector: '.option-darkening',
    declarations: ['270deg', 'rgba(23, 22, 20, 0) -28.59%', '#171614 110.26%'],
  },
]

/** Legacy utility, kept as a Tailwind 4 `@utility`. */
export const NO_SCROLLBAR_DECLARATIONS = [
  'scrollbar-width: none',
  '-ms-overflow-style: none',
  'display: none',
]

/** Legacy rules that are deliberately not ported (docs/adr/0006-styling-and-motion.md). */
export const DROPPED_SELECTORS = ['.react-tel-input', '.text-balance', '@font-face']
