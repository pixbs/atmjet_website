import type { ReactNode } from 'react'

import { ImagesCarousel } from '@/components/ui/images-carousel'
import { cn } from '@/lib/cn'
import type { ImageSource } from '@/lib/media'

/**
 * One yacht for sale (issue #100, `docs/legacy-inventory.md` section 6): its photographs in a
 * carousel, the three counts beside them, and the specifications on ruled rows.
 *
 * The rows arrive as they are to be printed, as the aircraft card's do (issue #99): the legacy
 * card hard-coded `Guests:` and `Shipyard:` in English on a site served in three languages
 * (section 10.4), and which specifications a card shows is the page's to decide.
 */

/** A count with an icon beside it: guests, cabins, crew. */
export interface YachtFigure {
  label: string
  value: string
  icon: ReactNode
}

export interface YachtSpec {
  label: string
  value: string
}

export interface YachtCardProps {
  photos: readonly ImageSource[]
  figures: readonly YachtFigure[]
  specs: readonly YachtSpec[]
  /** What a screen reader calls the carousel's controls. */
  labels: { previous: string; next: string; slides: string }
  className?: string
}

export function YachtCard({ photos, figures, specs, labels, className }: YachtCardProps) {
  return (
    <div className={cn('relative w-full shrink-0 gap-6 pr-4 md:gap-10 lg:flex-row', className)}>
      <div className="relative w-full overflow-hidden rounded-xl">
        <ImagesCarousel images={photos} labels={labels} />
      </div>
      <div className="flex-row justify-around lg:flex-col">
        {figures.map((figure) => (
          <div key={figure.label} className="gap-2">
            <p className="font-semibold text-white">{figure.label}</p>
            <div className="flex-row gap-2">
              {figure.icon}
              <h3>{figure.value}</h3>
            </div>
          </div>
        ))}
      </div>
      <div className="min-w-80">
        {specs.map((spec) => (
          <div
            key={spec.label}
            className="h-10 flex-row items-center justify-between border-b border-graphite-800"
          >
            <p className="w-full">{spec.label}</p>
            <p className="w-full">{spec.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
