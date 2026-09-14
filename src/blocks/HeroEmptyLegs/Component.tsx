import Image from 'next/image'

import { Counter } from '@/components/motion/counter'
import type { ImageSource } from '@/lib/media'

/**
 * The empty legs hero (issue #133, `docs/legacy-inventory.md` section 4): the figure counting up
 * in gold over the heading, and under them a card holding a photograph beside its words.
 */

/** What the legacy asked the optimiser for; the picture fills its half of the card. */
const PHOTO = { width: 1920, height: 1080 }

export interface HeroEmptyLegsProps {
  figure: string
  title: string
  image: ImageSource
  subtitle: string
  description: string
}

export function HeroEmptyLegs({ figure, title, image, subtitle, description }: HeroEmptyLegsProps) {
  return (
    <section data-section="hero-empty-legs">
      <div className="container gap-16 pt-32 pb-24">
        <h1 className="text-center">
          <Counter className="bg-gold bg-clip-text pb-2 text-7xl text-transparent">
            {figure}
          </Counter>
          <br />
          {title}
        </h1>
        <div className="card items-center gap-4 overflow-hidden lg:flex-row">
          <div className="w-full">
            {/* The first screen of the page, so it is fetched with the markup rather than
                lazily, as every ported hero is (section 13, entry 15). */}
            <Image
              alt={image.alt === '' ? title : image.alt}
              className="w-full"
              height={PHOTO.height}
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              src={image.src}
              width={PHOTO.width}
            />
          </div>
          <div className="w-full gap-8 p-8">
            <h2>{subtitle}</h2>
            <p>{description}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
