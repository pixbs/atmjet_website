import Image from 'next/image'

import { Counter } from '@/components/motion/counter'
import type { ImageSource } from '@/lib/media'

/**
 * The partners hero (issue #133, `docs/legacy-inventory.md` section 4): the heading with its
 * gold figure, the sentence under it and a wide photograph under both.
 */

/** What the legacy asked the optimiser for; `h-64` decides the box on screen. */
const PHOTO = { width: 1200, height: 260 }

export interface HeroPartnersProps {
  title: string
  figure: string
  title2: string
  description: string
  image: ImageSource
}

export function HeroPartners({ title, figure, title2, description, image }: HeroPartnersProps) {
  return (
    <section data-section="hero-partners">
      <div className="container gap-20 pt-32">
        <div className="gap-10">
          <h1 className="text-center text-pretty">
            {title}
            {/* The figure keeps its width while it counts, so the heading does not shuffle. */}
            <Counter className="inline-block min-w-16 bg-gold bg-clip-text text-transparent">
              {figure}
            </Counter>
            {title2}
          </h1>
          <p className="text-center text-pretty">{description}</p>
        </div>
        {/* The first screen of the page, so it is fetched with the markup rather than lazily:
            the legacy marked every hero `loading='lazy'` (section 13, entry 15). */}
        <Image
          alt={image.alt === '' ? title : image.alt}
          className="h-64 rounded-2xl object-cover object-center"
          height={PHOTO.height}
          priority
          sizes="100vw"
          src={image.src}
          width={PHOTO.width}
        />
      </div>
    </section>
  )
}
