import Image from 'next/image'

import { Counter } from '@/components/motion/counter'
import { Reveal } from '@/components/motion/reveal'
import { cn } from '@/lib/cn'
import type { ImageSource } from '@/lib/media'

/**
 * One reason to fly with the company, as the "why us" sections stack them (issue #102,
 * `docs/legacy-inventory.md` section 6): a figure that counts up, the reason beside a
 * photograph, on a panel that sticks under the one before it as the section scrolls past.
 *
 * Where each card comes to rest is the section's to decide and arrives as `top`, because it
 * depends on how many cards there are — the group charters page lays the same card out without
 * a sticky column around it (E7.6, E8.12).
 */

/** The panel: the sticky stack, the tucked-up margin that overlaps it with the next one. */
const CARD =
  'card sticky -mb-16 gap-4 overflow-hidden bg-graphite-950/90 pb-24 backdrop-blur-lg last:mb-0 last:pb-10 md:flex-row md:gap-16 md:py-0 md:last:pb-0'

/**
 * The gold gradient through the figure. `md:bg-fixed` pins the gradient to the viewport rather
 * than to the text, so it shifts as the card scrolls — the legacy did that and it is visible
 * (`docs/legacy-inventory.md` section 13, the `bg-fixed` list).
 */
const FIGURE = 'bg-gold bg-clip-text font-serif text-6xl text-transparent md:bg-fixed'

export interface WhyUsCardProps {
  /** Counted up when the card comes into view; the group charters cards carry no figure. */
  num?: string
  /** The citizens cards have none, and the legacy kept the room the heading would have taken. */
  title?: string
  description: string
  /** Left out where the section shows no photograph. */
  image?: ImageSource
  /** How far down the viewport the card comes to rest, in pixels. */
  top: number
  className?: string
}

export function WhyUsCard({ num, title, description, image, top, className }: WhyUsCardProps) {
  return (
    // The offset is per card and counted from the ones above it, so it cannot be a class.
    <Reveal className={cn(CARD, className)} style={{ top }}>
      <div className="gap-4 p-8 md:w-full md:pt-16 md:pb-24">
        {num !== undefined && <Counter className={FIGURE}>{num}</Counter>}
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      {image && (
        <Image
          alt={image.alt}
          className="aspect-video w-full object-cover object-center lg:w-1/2"
          height={1200}
          src={image.src}
          width={1200}
        />
      )}
    </Reveal>
  )
}
