import type useEmblaCarousel from 'embla-carousel-react'

/**
 * The settings the legacy carousels ran on (issue #98, `docs/legacy-inventory.md` section 6).
 *
 * There were five of them — key features, we inspect, the sale yacht gallery, vehicles and
 * yachts — and between them they varied in exactly one thing: whether the slides wrap around.
 * Everything else was the same on all five, so it is the default here and a caller only says
 * what is different.
 */

/** Embla keeps its option type in the core package; taking it from the hook saves a dependency. */
export type CarouselOptions = NonNullable<Parameters<typeof useEmblaCarousel>[0]>

export function carouselOptions(overrides: CarouselOptions = {}): CarouselOptions {
  return { align: 'start', ...overrides }
}

/**
 * How far along the progress bar is, as the width its style takes.
 *
 * Embla reports progress outside 0 to 1 while a drag is held past either end, and the legacy
 * bar was written straight into `width`, so dragging past the last slide pushed a gold line out
 * of the section it belonged to. Clamped here, which is the whole of the difference.
 */
export function progressWidth(scrollProgress: number): string {
  if (!Number.isFinite(scrollProgress)) return '0%'

  const percent = Math.min(100, Math.max(0, scrollProgress * 100))

  return `${percent}%`
}
