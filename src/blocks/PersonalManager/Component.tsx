import Image from 'next/image'

import type { ImageSource } from '@/lib/media'

/**
 * The personal manager (issue #124, `docs/legacy-inventory.md` section 5): the photograph on the
 * right of a wide screen and above the words on a narrow one, the heading in gold, and the chips
 * under the sentence.
 *
 * The legacy markup carried a literal `aaa` and a `bg-red-50` debug background behind the
 * photograph (section 13, entry 22); both are left out, which is the decision on issue #124.
 */
export interface PersonalManagerProps {
  title: string
  description: string
  image: ImageSource
  chips: readonly string[]
}

export function PersonalManager({ title, description, image, chips }: PersonalManagerProps) {
  return (
    <section data-section="personal-manager">
      <div className="container">
        <div className="items-center gap-10 overflow-hidden rounded-2xl bg-graphite-950 lg:flex-row-reverse">
          <div className="relative aspect-video size-full lg:aspect-square">
            <Image
              alt={image.alt === '' ? title : image.alt}
              className="h-full object-cover object-top"
              fill
              loading="lazy"
              sizes="(min-width: 1024px) 50vw, 100vw"
              src={image.src}
            />
          </div>
          <div className="w-full gap-4 px-6 pb-10 lg:items-start lg:py-10">
            <h2 className="bg-gold bg-clip-text text-transparent">{title}</h2>
            <p>{description}</p>
            <div className="flex-row flex-wrap gap-2">
              {chips.map((chip) => (
                // The legacy `rounded-lg` pointed at a variable that was never defined, so the
                // chips are square (docs/adr/0006-styling-and-motion.md).
                <p key={chip} className="bg-graphite-900 p-2 text-sm text-graphite-100 uppercase">
                  {chip}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
