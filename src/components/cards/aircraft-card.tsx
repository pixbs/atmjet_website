import Image from 'next/image'

import { Line } from '@/components/motion/line'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/cn'
import type { ImageSource } from '@/lib/media'
import { internalPath } from '@/lib/urls'

/**
 * One aircraft in the listing (issue #135, `docs/legacy-inventory.md` section 4): the
 * photograph, which grows a little under the pointer, and under it the type with the
 * registration beside it, a rule, and the class the type belongs to.
 *
 * Two things changed, neither of them visible. The legacy card drew the same photograph twice —
 * `next/image` and a raw `<img>` under it, sharing a box with a fixed height — so the picture
 * was fetched twice and the two halves squeezed into the space of one (section 13, entry 27,
 * settled by the decision of 2026-09-13); one picture is drawn here. And the link carries the
 * locale, where the legacy card wrote a bare `/aircraft/…` that only answers through a redirect
 * (section 3.3).
 */
export interface AircraftCardProps {
  /** The last segment of the aircraft's own page. */
  slug: string
  name: string
  registration: string
  category: string
  image: ImageSource
  className?: string
}

export function AircraftCard({
  slug,
  name,
  registration,
  category,
  image,
  className,
}: AircraftCardProps) {
  return (
    <Link
      className={cn(
        'group overflow-hidden rounded-2xl border border-graphite-800 bg-graphite-950 p-0',
        className,
      )}
      href={internalPath(`/aircraft/${slug}`)}
    >
      <div className="relative aspect-video overflow-hidden">
        <Image
          alt={`${name} ${registration}`}
          className="object-cover object-center transition-transform duration-300 ease-out group-hover:scale-125"
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          src={image.src}
        />
      </div>
      <div className="gap-3 p-6 pb-8">
        <h3>
          {name} {registration}
        </h3>
        <Line />
        <p>{category}</p>
      </div>
    </Link>
  )
}
