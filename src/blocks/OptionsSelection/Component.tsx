import Image from 'next/image'

import type { ImageSource } from '@/lib/media'

/**
 * The services either department provides (issue #127, `docs/legacy-inventory.md` section 5):
 * one heading over two cards, each opening on a photograph, with its promises boxed underneath.
 */

/** What the legacy asked the optimiser for; `h-48 w-full` decides the box on screen. */
const PHOTO = { width: 1128, height: 200 }

export interface OptionCardProps {
  title: string
  description: string
  items: readonly string[]
  image: ImageSource
}

export interface OptionsSelectionProps {
  title: string
  cards: readonly OptionCardProps[]
}

export function OptionsSelection({ title, cards }: OptionsSelectionProps) {
  return (
    <section data-section="options-selection">
      <div className="container gap-8">
        <h2 className="text-center">{title}</h2>
        {/* `.container` is unlayered, but this row is a plain div, so no marker is needed. */}
        <div className="gap-8 lg:flex-row">
          {cards.map((card) => (
            <OptionCard key={card.title} {...card} />
          ))}
        </div>
      </div>
    </section>
  )
}

function OptionCard({ title, description, items, image }: OptionCardProps) {
  return (
    // The legacy card also carried `sticky` with no offset to stick to, which draws nothing
    // (`docs/legacy-inventory.md` section 13, entry 17).
    <div className="card w-full gap-4 overflow-hidden bg-graphite-950">
      <Image
        alt={image.alt === '' ? title : image.alt}
        className="h-48 w-full object-cover object-center"
        height={PHOTO.height}
        loading="lazy"
        sizes="(min-width: 1024px) 50vw, 100vw"
        src={image.src}
        width={PHOTO.width}
      />
      <div className="gap-4 p-8">
        <h3 className="bg-gold bg-clip-text text-transparent">{title}</h3>
        <p>{description}</p>
      </div>
      <div className="gap-1 p-8 pt-0">
        {items.map((item) => (
          // The legacy `rounded-lg` pointed at a variable that was never defined, so the boxes
          // are square (docs/adr/0006-styling-and-motion.md).
          <div key={item} className="bg-graphite-900 px-6 py-4 text-graphite-100">
            <p className="bg-gold bg-clip-text text-transparent">{item}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
