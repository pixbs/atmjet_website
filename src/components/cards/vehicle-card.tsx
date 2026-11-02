import { Arrive, SettleImage } from '@/components/motion/arrive'
import { Link } from '@/i18n/navigation'
import { canonicalRegistration } from '@/lib/aircraft'
import { cn } from '@/lib/cn'
import type { ImageSource } from '@/lib/media'
import { internalPath } from '@/lib/urls'

/**
 * One aircraft as the sales department page lists them (issue #99,
 * `docs/legacy-inventory.md` section 6): a photograph, the model, and the specifications under
 * it on ruled rows. The whole card is the link into the aircraft's own page.
 *
 * Two things changed, neither of them visible. The link carries the locale, where the legacy
 * card wrote a bare `/aircraft/…` that only answers through a redirect (section 3.3), and the
 * registration goes through `canonicalRegistration`, so a row that spells it `n-123ab` and one
 * that spells it `N123AB` lead to the same page.
 *
 * The rows arrive as they are to be printed. The legacy card hard-coded `Year:` and `Pax:` in
 * English on a site served in three languages (section 10.4), and which specifications a card
 * shows is the section's to decide.
 *
 * The card is a slide the carousel moves, so it is never moved itself: what it holds fades in
 * where it stands at its first pixel on screen, the photograph uncovered and settling, the model
 * and the rows rising after it, and the photograph leans in under the pointer (section 13, entry
 * 101). The model is not split into words, because a slide's words size the carousel.
 */

export interface VehicleSpec {
  label: string
  value: string
}

export interface VehicleCardProps {
  /** The registration, which is also the page the card opens. */
  registration: string
  model: string
  image: ImageSource
  specs: readonly VehicleSpec[]
  className?: string
}

export function VehicleCard({ registration, model, image, specs, className }: VehicleCardProps) {
  const tail = canonicalRegistration(registration) ?? registration

  return (
    <Link
      className={cn('w-full shrink-0 pr-4 md:w-1/2 lg:w-1/3', className)}
      href={internalPath(`/aircraft/${tail}`)}
    >
      <Arrive hover variant="fadeIn" whenPeeking>
        {/* The legacy drew the photograph as a background on an empty box. */}
        <div className="relative aspect-video overflow-hidden rounded-xl">
          <SettleImage
            alt={image.alt}
            className="object-cover object-center"
            fill
            /* A third of the row, half of it, and the one card the narrow scroller shows with the
               next one peeking past it — which is four fifths of the screen, not all of it. */
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 85vw"
            src={image.src}
          />
        </div>
        <Arrive as="h3" className="pt-10" wait={0.3} whenPeeking>
          {model}
        </Arrive>
        {specs.map((spec, index) => (
          <Arrive
            key={spec.label}
            className="h-10 flex-row items-center justify-between border-b border-graphite-800 first:mt-4"
            wait={0.4 + index * 0.08}
            whenPeeking
          >
            <p className="w-full">{spec.label}</p>
            <p className="w-full">{spec.value}</p>
          </Arrive>
        ))}
      </Arrive>
    </Link>
  )
}
