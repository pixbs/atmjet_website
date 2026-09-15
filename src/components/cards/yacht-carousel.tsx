import type { ReactNode } from 'react'

import { Carousel, CarouselArrows } from '@/components/ui/carousel'
import { cn } from '@/lib/cn'

/**
 * The yachts for sale, one card at a time (issue #100, `docs/legacy-inventory.md` section 6):
 * the cards in a row that loops, with the two arrows centred under them.
 *
 * The cards are children, so they stay server-rendered; only the carousel around them is a
 * client island (ADR-0007).
 */
export function YachtCarousel({
  children,
  labels,
  className,
}: {
  children: ReactNode
  labels: { previous: string; next: string }
  className?: string
}) {
  return (
    <Carousel
      className={cn('gap-4', className)}
      controls={<CarouselArrows className="w-full items-center justify-center" labels={labels} />}
      // The legacy carousel looped; holding a card to the left edge is the shared default.
      options={{ loop: true }}
    >
      {children}
    </Carousel>
  )
}
