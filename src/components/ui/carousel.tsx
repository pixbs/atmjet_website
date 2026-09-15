'use client'

import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react'
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures'
import { createContext, use, useEffect, useState, type ReactNode } from 'react'

import { LeftAngle } from '@/components/icons'
import { carouselOptions, progressWidth, type CarouselOptions } from '@/lib/carousel'
import { cn } from '@/lib/cn'

/**
 * The carousel the legacy site used five times over (issue #98, `docs/legacy-inventory.md`
 * section 6): embla with wheel gestures, the slides in a row that scrolls, and arrows, dots or a
 * progress bar depending on where it sat.
 *
 * It is one component here rather than five, and the controls are separate pieces a caller
 * arranges: the legacy put its arrows inside the frame, below it and outside it, and each copy
 * had its own carousel around them.
 *
 * The slides are `children` and can be server-rendered; only this file is a client island
 * (ADR-0007). The legacy `embla` and `embla__container` class names are not ported: they came
 * from a stylesheet that was never imported, so they styled nothing (section 13).
 */
type EmblaApi = UseEmblaCarouselType[1]

interface CarouselState {
  api: EmblaApi
  selectedIndex: number
  slideCount: number
  canScrollPrev: boolean
  canScrollNext: boolean
  progress: number
}

const CarouselContext = createContext<CarouselState | null>(null)

function useCarousel(): CarouselState {
  const state = use(CarouselContext)
  if (!state) throw new Error('A carousel control has to be rendered inside a Carousel.')

  return state
}

const READ_ON = ['select', 'reInit', 'scroll'] as const

export function Carousel({
  options,
  className,
  viewportClassName,
  containerClassName,
  controls,
  children,
}: {
  /** Only what differs from the shared settings; `loop` is the one the legacy varied. */
  options?: CarouselOptions
  className?: string
  viewportClassName?: string
  containerClassName?: string
  /** Arrows, dots or a progress bar, placed where this carousel wants them. */
  controls?: ReactNode
  /** The slides. Each one sets its own width and does not shrink. */
  children: ReactNode
}) {
  const [viewportRef, api] = useEmblaCarousel(carouselOptions(options), [WheelGesturesPlugin()])
  const [reading, setReading] = useState({
    selectedIndex: 0,
    slideCount: 0,
    canScrollPrev: false,
    canScrollNext: false,
    progress: 0,
  })

  useEffect(() => {
    if (!api) return

    // Embla is the external system here: it moves the slides, and this reads back where they are.
    const read = () =>
      setReading({
        selectedIndex: api.selectedScrollSnap(),
        slideCount: api.scrollSnapList().length,
        canScrollPrev: api.canScrollPrev(),
        canScrollNext: api.canScrollNext(),
        progress: api.scrollProgress(),
      })

    for (const event of READ_ON) api.on(event, read)
    // Embla has already initialised by the time the hook hands it back, so the first reading has
    // to be asked for rather than waited for.
    read()

    return () => {
      for (const event of READ_ON) api.off(event, read)
    }
  }, [api])

  return (
    <CarouselContext value={{ api, ...reading }}>
      <div className={cn('relative', className)}>
        <div className={cn('overflow-clip', viewportClassName)} ref={viewportRef}>
          <div className={cn('flex-row', containerClassName)}>{children}</div>
        </div>
        {controls}
      </div>
    </CarouselContext>
  )
}

/**
 * The two arrows. `rounded-none` rather than no radius class at all: the legacy `rounded-lg`
 * pointed at a variable that was never defined, which reset the corners the global button rule
 * had rounded, so dropping the class here would round them instead (ADR-0006).
 *
 * The disabled arrow looks the same as an enabled one, as the legacy one did; `hover:opacity-100`
 * is what holds it still under the global `button:hover` fade.
 */
const ARROW =
  'flex size-10 items-center justify-center rounded-none border-2 border-graphite-500 bg-graphite-900! text-graphite-300 hover:border-graphite-300 hover:opacity-100'

export function CarouselArrows({
  className,
  labels,
}: {
  className?: string
  /** What a screen reader calls them; the legacy arrows were two unnamed buttons. */
  labels: { previous: string; next: string }
}) {
  return (
    <div className={cn('flex-row gap-2', className)}>
      <Arrow label={labels.previous} towards="previous" />
      <Arrow label={labels.next} towards="next" />
    </div>
  )
}

/**
 * The same two arrows, one against each edge of the frame and out of it from `lg` up: the
 * vehicles carousel of the sales department page hung them there rather than under the slides
 * (`docs/legacy-inventory.md` section 6).
 */
export function CarouselSideArrows({ labels }: { labels: { previous: string; next: string } }) {
  return (
    <>
      <Arrow
        className="absolute top-1/2 -left-4 -translate-y-1/2 lg:-translate-x-full"
        label={labels.previous}
        towards="previous"
      />
      <Arrow
        className="absolute top-1/2 -right-4 -translate-y-1/2 lg:translate-x-full"
        label={labels.next}
        towards="next"
      />
    </>
  )
}

function Arrow({
  className,
  label,
  towards,
}: {
  className?: string
  label: string
  towards: 'previous' | 'next'
}) {
  const { api, canScrollPrev, canScrollNext } = useCarousel()
  const back = towards === 'previous'

  return (
    <button
      aria-label={label}
      className={cn(ARROW, className)}
      disabled={back ? !canScrollPrev : !canScrollNext}
      onClick={() => (back ? api?.scrollPrev() : api?.scrollNext())}
      type="button"
    >
      <LeftAngle className={cn('h-3.5 w-7', !back && 'rotate-180')} />
    </button>
  )
}

/** One dot per page of slides, the one being shown filled with the gold gradient. */
export function CarouselDots({ className, label }: { className?: string; label: string }) {
  const { api, selectedIndex, slideCount } = useCarousel()

  return (
    <div
      aria-label={label}
      className={cn('flex-row flex-wrap items-center justify-center gap-2', className)}
      role="tablist"
    >
      {Array.from({ length: slideCount }, (_, index) => (
        <button
          key={index}
          aria-label={`${index + 1}`}
          aria-selected={index === selectedIndex}
          className={cn(
            'size-4 appearance-none rounded-full p-0',
            index === selectedIndex ? 'bg-gold' : 'bg-graphite-500',
          )}
          onClick={() => api?.scrollTo(index)}
          role="tab"
          type="button"
        />
      ))}
    </div>
  )
}

/** The gold line under the "we inspect" carousel, filling as the slides move. */
export function CarouselProgress({ className }: { className?: string }) {
  const { progress } = useCarousel()

  return (
    <div className={cn('h-2 w-full', className)}>
      <div
        aria-hidden
        className="h-2 rounded-full bg-gold"
        style={{ width: progressWidth(progress) }}
      />
    </div>
  )
}
