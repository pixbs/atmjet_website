import Image from 'next/image'

import type { ImageSource } from '@/lib/media'

import { Carousel, CarouselArrows, CarouselDots } from './carousel'

/**
 * The photographs of one listing (issue #100, `docs/legacy-inventory.md` section 6): a slide per
 * photograph, an arrow at either edge and a dot per photograph along the bottom.
 *
 * The legacy element was a carousel of its own, with its own embla instance and its own copies of
 * the arrows and dots; here it is the shared one (issue #98) with its controls placed where that
 * element placed them. The slides are server-rendered, as `Carousel` takes them as children.
 */
export interface ImagesCarouselProps {
  images: readonly ImageSource[]
  /** What a screen reader calls the controls; the legacy arrows were two unnamed buttons. */
  labels: { previous: string; next: string; slides: string }
  className?: string
}

export function ImagesCarousel({ images, labels, className }: ImagesCarouselProps) {
  return (
    <Carousel
      className={className}
      controls={
        <>
          {/* One row holding both arrows where the legacy had two absolutely placed buttons. */}
          <CarouselArrows
            className="absolute inset-x-4 top-1/2 -translate-y-1/2 justify-between"
            labels={labels}
          />
          <CarouselDots className="absolute inset-x-0 bottom-2 z-30" label={labels.slides} />
        </>
      }
      viewportClassName="bg-graphite-950"
    >
      {images.map((image, index) => (
        <Image
          key={image.src}
          alt={image.alt}
          className="aspect-video w-full shrink-0 rounded-xl object-cover object-center"
          height={405}
          // The legacy marked every slide lazy, including the one on show, which left the card
          // empty until the browser got round to it. The one on show arrives with the page; the
          // rest wait to be asked for, as they did.
          loading={index === 0 ? 'eager' : 'lazy'}
          sizes="(min-width: 1024px) 50vw, 75vw"
          src={image.src}
          width={720}
        />
      ))}
    </Carousel>
  )
}
