/**
 * The legacy design contract as a fixture (issue #47): every value that
 * src/app/(frontend)/globals.css must reproduce, taken from `legacy/v1:tailwind.config.ts`,
 * `legacy/v1:src/app/[locale]/globals.css` and docs/legacy-inventory.md sections 10.1-10.3.
 * docs/adr/0006-styling-and-motion.md carries the same map in prose.
 */

export interface TokenCase {
  /** How the legacy site referred to it (class or config key). */
  legacy: string
  /** The theme variable this project defines. */
  variable: string
  /** Its value, exactly as the legacy site computed it. */
  value: string
  /** A utility that must resolve through the variable. */
  utility: string
  /** Text the generated utility must contain. */
  declaration: string
}

/** Legacy gray ramp (inverted: low = dark), plus every non-gray colour live markup used. */
export const PALETTE: TokenCase[] = [
  {
    legacy: 'gray-900',
    variable: '--color-white',
    value: '#ffffff',
    utility: 'text-white',
    declaration: 'color: var(--color-white)',
  },
  {
    legacy: 'gray-800',
    variable: '--color-graphite-100',
    value: '#f0f1f6',
    utility: 'bg-graphite-100',
    declaration: 'background-color: var(--color-graphite-100)',
  },
  {
    legacy: 'gray-700',
    variable: '--color-graphite-300',
    value: '#c0c9cb',
    utility: 'border-graphite-300',
    declaration: 'border-color: var(--color-graphite-300)',
  },
  {
    legacy: 'gray-600',
    variable: '--color-graphite-400',
    value: '#a2abad',
    utility: 'text-graphite-400',
    declaration: 'color: var(--color-graphite-400)',
  },
  {
    legacy: 'gray-500',
    variable: '--color-graphite-500',
    value: '#707070',
    utility: 'text-graphite-500',
    declaration: 'color: var(--color-graphite-500)',
  },
  {
    legacy: 'gray-400',
    variable: '--color-graphite-700',
    value: '#474444',
    utility: 'border-graphite-700',
    declaration: 'border-color: var(--color-graphite-700)',
  },
  {
    legacy: 'gray-300',
    variable: '--color-graphite-800',
    value: '#2c2c2c',
    utility: 'border-graphite-800',
    declaration: 'border-color: var(--color-graphite-800)',
  },
  {
    legacy: 'gray-200',
    variable: '--color-graphite-850',
    value: '#1e1e1e',
    utility: 'bg-graphite-850',
    declaration: 'background-color: var(--color-graphite-850)',
  },
  {
    legacy: 'gray-100',
    variable: '--color-graphite-900',
    value: '#1a1a1a',
    utility: 'bg-graphite-900',
    declaration: 'background-color: var(--color-graphite-900)',
  },
  {
    legacy: 'gray-150',
    variable: '--color-graphite-950',
    value: '#171614',
    utility: 'bg-graphite-950',
    declaration: 'background-color: var(--color-graphite-950)',
  },
  {
    legacy: 'black',
    variable: '--color-black',
    value: '#000000',
    utility: 'text-black',
    declaration: 'color: var(--color-black)',
  },
  {
    legacy: 'gold gradient stop 3',
    variable: '--color-gold-300',
    value: '#efd487',
    utility: 'bg-gold-300',
    declaration: 'background-color: var(--color-gold-300)',
  },
  {
    legacy: 'gold gradient stop 4',
    variable: '--color-gold-400',
    value: '#ebca7a',
    utility: 'bg-gold-400',
    declaration: 'background-color: var(--color-gold-400)',
  },
  {
    legacy: 'gold gradient stop 2',
    variable: '--color-gold-500',
    value: '#e6be6b',
    utility: 'bg-gold-500',
    declaration: 'background-color: var(--color-gold-500)',
  },
  {
    legacy: 'gold gradient stop 1',
    variable: '--color-gold-600',
    value: '#dfab53',
    utility: 'bg-gold-600',
    declaration: 'background-color: var(--color-gold-600)',
  },
  {
    legacy: 'to-[#14323D]',
    variable: '--color-teal-950',
    value: '#14323d',
    utility: 'to-teal-950',
    declaration: '--color-teal-950',
  },
  {
    legacy: 'to-[#0e2a15]',
    variable: '--color-green-950',
    value: '#0e2a15',
    utility: 'to-green-950',
    declaration: '--color-green-950',
  },
  {
    legacy: 'red-50',
    variable: '--color-red-50',
    value: '#fef2f2',
    utility: 'bg-red-50',
    declaration: 'background-color: var(--color-red-50)',
  },
  {
    legacy: 'red-500',
    variable: '--color-red-500',
    value: '#ef4444',
    utility: 'border-red-500',
    declaration: 'border-color: var(--color-red-500)',
  },
  {
    legacy: 'orange-200',
    variable: '--color-orange-200',
    value: '#fed7aa',
    utility: 'text-orange-200',
    declaration: 'color: var(--color-orange-200)',
  },
  {
    legacy: 'blue-600',
    variable: '--color-blue-600',
    value: '#2563eb',
    utility: 'bg-blue-600',
    declaration: 'background-color: var(--color-blue-600)',
  },
  {
    legacy: 'neutral-900',
    variable: '--color-neutral-900',
    value: '#171717',
    utility: 'bg-neutral-900',
    declaration: 'background-color: var(--color-neutral-900)',
  },
]

/** `backgroundImage.gold`, verbatim: gold buttons, badges, borders and gold text. */
export const GOLD_GRADIENT: TokenCase = {
  legacy: 'bg-gold',
  variable: '--background-image-gold',
  value:
    'linear-gradient(22deg, #DFAB53 -24.85%, #E6BE6B -7.56%, #EFD487 12.04%, #EBCA7A 33.04%, #DFAB53 98.1%), linear-gradient(180deg, rgba(21, 21, 21, 0.00) 0%, rgba(21, 21, 21, 0.01) 6.67%, rgba(21, 21, 21, 0.04) 13.33%, rgba(21, 21, 21, 0.08) 20%, rgba(21, 21, 21, 0.15) 26.67%, rgba(21, 21, 21, 0.23) 33.33%, rgba(21, 21, 21, 0.33) 40%, rgba(21, 21, 21, 0.44) 46.67%, rgba(21, 21, 21, 0.56) 53.33%, rgba(21, 21, 21, 0.67) 60%, rgba(21, 21, 21, 0.77) 66.67%, rgba(21, 21, 21, 0.85) 73.33%, rgba(21, 21, 21, 0.92) 80%, rgba(21, 21, 21, 0.96) 86.67%, rgba(21, 21, 21, 0.99) 93.33%, #151515 100%)',
  utility: 'bg-gold',
  declaration: 'background-image: var(--background-image-gold)',
}

/** The two legacy font stacks; E3.5 fills the two variables through next/font. */
export const FONTS: TokenCase[] = [
  {
    legacy: "fontFamily.sans ['Inter', 'sans-serif']",
    variable: '--font-sans',
    value: 'var(--font-inter, Inter), sans-serif',
    utility: 'font-sans',
    declaration: 'font-family: var(--font-sans)',
  },
  {
    legacy: "fontFamily.serif ['TARegressoPROEasyRegular', 'serif']",
    variable: '--font-serif',
    value: 'var(--font-regresso, TARegressoPROEasyRegular), serif',
    utility: 'font-serif',
    declaration: 'font-family: var(--font-serif)',
  },
]

/**
 * Only the radii that rendered on the legacy site, under the Tailwind 4 names: the legacy
 * `rounded` (0.25rem) is `rounded-sm` here. The legacy `rounded-sm/md/lg` pointed at an
 * undefined `--radius` and rendered square corners, so `--radius-md`/`--radius-lg` and the
 * deprecated bare `rounded` stay undefined (see REMOVED_CLASSES).
 */
export const RADII: TokenCase[] = [
  {
    legacy: 'rounded (renamed by Tailwind 4)',
    variable: '--radius-sm',
    value: '0.25rem',
    utility: 'rounded-sm',
    declaration: 'border-radius: var(--radius-sm)',
  },
  {
    legacy: 'rounded-xl',
    variable: '--radius-xl',
    value: '0.75rem',
    utility: 'rounded-xl',
    declaration: 'border-radius: var(--radius-xl)',
  },
  {
    legacy: 'rounded-2xl',
    variable: '--radius-2xl',
    value: '1rem',
    utility: 'rounded-2xl',
    declaration: 'border-radius: var(--radius-2xl)',
  },
  {
    legacy: 'rounded-3xl',
    variable: '--radius-3xl',
    value: '1.5rem',
    utility: 'rounded-3xl',
    declaration: 'border-radius: var(--radius-3xl)',
  },
]

/** Stacking order: the legacy z-[900]/z-[901]/z-[998]/z-[999] layers (inventory 10.3). */
export const Z_INDEX: TokenCase[] = [
  {
    legacy: 'z-[900]',
    variable: '--z-index-cookie-banner',
    value: '900',
    utility: 'z-cookie-banner',
    declaration: 'z-index: var(--z-index-cookie-banner)',
  },
  {
    legacy: 'z-[901]',
    variable: '--z-index-cookie-modal',
    value: '901',
    utility: 'z-cookie-modal',
    declaration: 'z-index: var(--z-index-cookie-modal)',
  },
  {
    legacy: 'z-[998]',
    variable: '--z-index-preloader-backdrop',
    value: '998',
    utility: 'z-preloader-backdrop',
    declaration: 'z-index: var(--z-index-preloader-backdrop)',
  },
  {
    legacy: 'z-[999]',
    variable: '--z-index-preloader',
    value: '999',
    utility: 'z-preloader',
    declaration: 'z-index: var(--z-index-preloader)',
  },
  {
    legacy: 'z-[999] (autocomplete dropdown)',
    variable: '--z-index-dropdown',
    value: '999',
    utility: 'z-dropdown',
    declaration: 'z-index: var(--z-index-dropdown)',
  },
]

/** Geometry the legacy markup expressed as arbitrary values, plus its one shadow. */
export const GEOMETRY: TokenCase[] = [
  {
    legacy: 'gap-[2px], mt-[2px]',
    variable: '--spacing-seam',
    value: '2px',
    utility: 'gap-seam',
    declaration: 'gap: var(--spacing-seam)',
  },
  {
    legacy: 'mb-[-80px]',
    variable: '--spacing-hero-overlap',
    value: '80px',
    utility: '-mb-hero-overlap',
    declaration: 'margin-bottom: calc(var(--spacing-hero-overlap) * -1)',
  },
  {
    legacy: 'h-[40vh]',
    variable: '--spacing-hero-band',
    value: '40vh',
    utility: 'h-hero-band',
    declaration: 'height: var(--spacing-hero-band)',
  },
  {
    legacy: 'h-[80svh]',
    variable: '--spacing-hero-basic',
    value: '80svh',
    utility: 'h-hero-basic',
    declaration: 'height: var(--spacing-hero-basic)',
  },
  {
    legacy: 'w-[60vw]',
    variable: '--spacing-preloader-logo',
    value: '60vw',
    utility: 'w-preloader-logo',
    declaration: 'width: var(--spacing-preloader-logo)',
  },
  {
    legacy: 'top-[20vh]',
    variable: '--inset-hero-band',
    value: '20vh',
    utility: 'top-hero-band',
    declaration: 'top: var(--inset-hero-band)',
  },
  {
    legacy: 'aspect-[3/4]',
    variable: '--aspect-portrait',
    value: '3 / 4',
    utility: 'aspect-portrait',
    declaration: 'aspect-ratio: var(--aspect-portrait)',
  },
  {
    legacy: 'aspect-[3/1]',
    variable: '--aspect-banner',
    value: '3 / 1',
    utility: 'aspect-banner',
    declaration: 'aspect-ratio: var(--aspect-banner)',
  },
  {
    legacy: 'aspect-[17/5]',
    variable: '--aspect-panorama',
    value: '17 / 5',
    utility: 'aspect-panorama',
    declaration: 'aspect-ratio: var(--aspect-panorama)',
  },
  {
    legacy: 'shadow-[0_6px_20px_rgba(0,0,0,0.08)]',
    variable: '--shadow-dropdown',
    value: '0 6px 20px rgba(0, 0, 0, 0.08)',
    utility: 'shadow-dropdown',
    declaration: '0 6px 20px',
  },
]

/** The legacy (Tailwind 3) pixel breakpoints, which also drive `max-w-screen-*`. */
export const BREAKPOINTS = [
  { name: 'sm', value: '640px', utility: 'sm:flex', media: '@media (width >= 640px)' },
  { name: 'md', value: '768px', utility: 'md:flex', media: '@media (width >= 768px)' },
  { name: 'lg', value: '1024px', utility: 'lg:flex', media: '@media (width >= 1024px)' },
  { name: 'xl', value: '1280px', utility: 'xl:flex', media: '@media (width >= 1280px)' },
  { name: '2xl', value: '1536px', utility: '2xl:flex', media: '@media (width >= 1536px)' },
] as const

/** `max-w-screen-*` must keep resolving to the breakpoints (legacy container widths). */
export const SCREEN_CONTAINERS = [
  { utility: 'max-w-screen-md', declaration: 'max-width: var(--breakpoint-md)' },
  { utility: 'max-w-screen-xl', declaration: 'max-width: var(--breakpoint-xl)' },
]

/**
 * Classes that must NOT compile: the Tailwind defaults this theme clears, the legacy
 * names that were renamed, and the radii that rendered square on the legacy site.
 * A class that silently resolves to a different value is the failure mode this guards.
 */
export const REMOVED_CLASSES = [
  'bg-gray-100',
  'bg-gray-150',
  'text-gray-900',
  'border-gray-300',
  'placeholder-gray-400',
  'bg-slate-500',
  'text-emerald-400',
  'rounded',
  'rounded-md',
  'rounded-lg',
  'font-display',
  'bg-surface',
  'text-on-surface',
  'bg-brand',
]
