import type { ReactNode } from 'react'

import { Carousel, CarouselSideArrows } from '@/components/ui/carousel'

/**
 * The aircraft of the sales department page, one row of cards at a time (issue #99,
 * `docs/legacy-inventory.md` section 6): the cards in a row that loops, with an arrow against
 * each edge of the frame rather than under it.
 *
 * The cards are children, so they stay server-rendered; only the carousel around them is a
 * client island (ADR-0007).
 */
export function VehiclesCarousel({
  children,
  labels,
}: {
  children: ReactNode
  labels: { previous: string; next: string }
}) {
  // The legacy carousel looped; holding a card to the left edge is the shared default.
  return (
    <Carousel controls={<CarouselSideArrows labels={labels} />} options={{ loop: true }}>
      {children}
    </Carousel>
  )
}
