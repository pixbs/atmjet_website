import Image from 'next/image'

import type { ImageSource } from '@/lib/media'

/**
 * The personal manager (issue #124, `docs/legacy-inventory.md` section 5): the photograph on one
 * side from the large breakpoint up, the gold heading, the paragraph and the chips on the other.
 *
 * The legacy section rendered a stray `aaa` next to the photograph and a red placeholder behind
 * it; both are dropped, which is the decision recorded on the issue.
 */
export interface PersonalManagerProps {
  title: string
  description: string
  image: ImageSource
  chips: string[]
}

/** One of the words under the paragraph. */
const CHIP = 'rounded-lg bg-graphite-900 p-2 text-sm text-graphite-100 uppercase'

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
              sizes="(min-width: 1024px) 50vw, 100vw"
              src={image.src}
            />
          </div>
          <div className="w-full gap-4 px-6 pb-10 lg:items-start lg:py-10">
            <h2 className="bg-gold bg-clip-text text-transparent">{title}</h2>
            <p>{description}</p>
            <div className="flex-row flex-wrap gap-2" data-cards="chip">
              {chips.map((chip) => (
                <p className={CHIP} key={chip}>
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
