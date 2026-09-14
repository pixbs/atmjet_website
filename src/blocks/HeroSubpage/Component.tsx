import Image from 'next/image'

import type { ImageSource } from '@/lib/media'

/**
 * The subpage hero (issue #112, `docs/legacy-inventory.md` section 5), as the cargo charter,
 * citizens, group charters and medical aviation pages open.
 *
 * The paragraph is drawn whether or not there is anything in it, which is what the legacy did
 * and what the spacing of those four pages depends on: the citizens page passed an empty
 * string and kept the gap it left.
 */
export interface HeroSubpageProps {
  title: string
  description?: string
  image: ImageSource
}

export function HeroSubpage({ title, description, image }: HeroSubpageProps) {
  return (
    <section data-section="hero-subpage">
      <div className="container gap-20 pt-32">
        <div className="gap-4">
          <h1 className="text-center">{title}</h1>
          <p className="text-center text-balance">{description}</p>
        </div>
        {/* The first screen of the page, so it is fetched with the markup rather than lazily:
            the legacy marked every hero `loading='lazy'` (section 13, entry 15). */}
        <Image
          alt={image.alt === '' ? title : image.alt}
          className="h-64 w-full rounded-2xl object-cover"
          height={1080}
          priority
          sizes="100vw"
          src={image.src}
          width={1920}
        />
      </div>
    </section>
  )
}
