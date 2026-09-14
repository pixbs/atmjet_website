import Image from 'next/image'

import { Reveal } from '@/components/motion/reveal'
import type { ImageSource } from '@/lib/media'

/**
 * The advantages section (issue #128, `docs/legacy-inventory.md` section 5): the heading over a
 * panel that rises into view, a wide photograph across it and the columns under that.
 *
 * The panel and each column carry the same reveal, which is the shared card reveal down to the
 * fifty pixels and the half second (`src/lib/motion.ts`).
 */

/** What the legacy asked the optimiser for; `aspect-panorama` decides the box on screen. */
const BANNER = { width: 1360, height: 400 }

/** The panel, repeated by the legacy on the wrapper around it. */
const PANEL = 'gap-10 overflow-hidden rounded-2xl bg-graphite-950'

export interface AdvantagesProps {
  title: string
  image: ImageSource
  cards: { title: string; description: string }[]
}

export function Advantages({ title, image, cards }: AdvantagesProps) {
  return (
    <section data-section="advantages">
      <div className="container">
        <h2 className="mb-4 text-center">{title}</h2>
        <div className={PANEL}>
          <Reveal className={`${PANEL} pb-8`}>
            <Image
              alt={image.alt === '' ? title : image.alt}
              className="aspect-panorama object-cover object-center"
              height={BANNER.height}
              sizes="(min-width: 1280px) 1280px, 100vw"
              src={image.src}
              width={BANNER.width}
            />
            <div className="gap-8 px-6 md:flex-row" data-cards="advantage">
              {cards.map((card) => (
                <Reveal key={card.title} className="w-full gap-3">
                  <h3 className="md:text-center">{card.title}</h3>
                  <p className="md:text-center">{card.description}</p>
                </Reveal>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
