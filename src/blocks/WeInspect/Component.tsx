import Image from 'next/image'

import { Carousel, CarouselProgress } from '@/components/ui/carousel'
import type { ImageSource } from '@/lib/media'

/**
 * The inspection section (issue #126, `docs/legacy-inventory.md` section 5): the heading over a
 * row of cards that scrolls, each a few words above a photograph, with the gold line under them
 * filling as they move.
 *
 * The cards are server-rendered and handed to the carousel primitive (issue #98), which is the
 * only client island here (ADR-0007).
 */

/** What the legacy asked the optimiser for; `h-52` decides the box on screen. */
const PHOTO = { width: 560, height: 320 }

/**
 * One card. It keeps its own width and does not shrink, as every card in this carousel does; the
 * legacy `bg-cover bg-center` are left out, there being no background image under them.
 */
const SLIDE =
  'mr-8 w-4/5 shrink-0 justify-between gap-3 overflow-hidden rounded-xl bg-graphite-950 pt-8 last:mr-0 md:w-2/3 lg:w-1/3'

export interface WeInspectProps {
  title: string
  slides: { title: string; description: string; image: ImageSource }[]
}

export function WeInspect({ title, slides }: WeInspectProps) {
  return (
    <section className="overflow-hidden" data-section="we-inspect">
      <div className="container gap-8">
        <h2>{title}</h2>
        <Carousel
          // The line is measured from the container rather than from the slides, which is where
          // the legacy put it: the frame around them was an unstyled div (section 6).
          className="static"
          controls={<CarouselProgress className="absolute -bottom-10 left-0" />}
          // That same unstyled frame clipped nothing, so the cards run into the page gutter and
          // it is the section that cuts them off — unlike the key features carousel (section 6).
          viewportClassName="overflow-visible"
        >
          {slides.map((slide) => (
            <div className={SLIDE} data-card="inspect" key={slide.title}>
              <div className="gap-3 px-8">
                <h3>{slide.title}</h3>
                <p>{slide.description}</p>
              </div>
              <Image
                alt={slide.image.alt === '' ? slide.title : slide.image.alt}
                className="h-52 w-full object-cover object-center"
                height={PHOTO.height}
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 66vw, 80vw"
                src={slide.image.src}
                width={PHOTO.width}
              />
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  )
}
