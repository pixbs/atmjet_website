import Image from 'next/image'

import { Reveal } from '@/components/motion/reveal'
import { cn } from '@/lib/cn'
import { fadeReveal } from '@/lib/motion'
import type { ImageSource } from '@/lib/media'

/**
 * One key feature, as the medical aviation page shows them (issue #105,
 * `docs/legacy-inventory.md` section 6): a tall photograph with the heading and the sentence
 * over its darkened foot.
 *
 * It is drawn to sit in the carousel primitive (issue #98), which is why it keeps its own width
 * and does not shrink: the legacy card carried embla's own class names for that, and those
 * render nothing (section 13, entry 17), so the widths are ported and the names are not.
 */

/** The card fades in where the others rise: `opacity` alone, over the same half second. */
const REVEAL = 'relative aspect-portrait w-full shrink-0 justify-end gap-4 pr-10 md:w-1/2'

export interface KeyFeatureCardProps {
  title: string
  description: string
  image: ImageSource
  className?: string
}

export function KeyFeatureCard({ title, description, image, className }: KeyFeatureCardProps) {
  return (
    <Reveal className={cn(REVEAL, className)} variants={fadeReveal}>
      <h3 className="z-10">{title}</h3>
      <p className="z-10">{description}</p>
      {/* Half the screen from the medium breakpoint up, and the whole of it below. */}
      <Image
        alt={image.alt}
        className="absolute inset-0 size-full object-cover object-center"
        height={500}
        sizes="(min-width: 768px) 50vw, 100vw"
        src={image.src}
        width={400}
      />
      <div className="darkening absolute inset-0" />
    </Reveal>
  )
}
