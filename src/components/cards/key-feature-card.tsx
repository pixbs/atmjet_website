import { Arrive, SettleImage } from '@/components/motion/arrive'
import { cn } from '@/lib/cn'
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

/**
 * The card fades in where it stands rather than rising, because it is a slide and the carousel
 * moves it, while its photograph is uncovered and settles inside it (section 13, entry 101). It
 * clips that photograph, which fills it exactly.
 */
const CARD =
  'relative aspect-portrait w-full shrink-0 justify-end gap-4 overflow-hidden pr-10 md:w-1/2'

export interface KeyFeatureCardProps {
  title: string
  description: string
  image: ImageSource
  className?: string
}

export function KeyFeatureCard({ title, description, image, className }: KeyFeatureCardProps) {
  return (
    <Arrive className={cn(CARD, className)} hover variant="fadeIn" whenPeeking>
      {/* Not split into words: a slide's words size the carousel, and split ones by a fraction
          of a pixel more. */}
      <Arrive as="h3" className="z-10" wait={0.35} whenPeeking>
        {title}
      </Arrive>
      <Arrive as="p" className="z-10" wait={0.5} whenPeeking>
        {description}
      </Arrive>
      {/* Half the screen from the medium breakpoint up, and the whole of it below. */}
      <SettleImage
        alt={image.alt}
        className="absolute inset-0 size-full object-cover object-center"
        height={500}
        sizes="(min-width: 768px) 50vw, 100vw"
        src={image.src}
        width={400}
      />
      <div className="darkening absolute inset-0" />
    </Arrive>
  )
}
