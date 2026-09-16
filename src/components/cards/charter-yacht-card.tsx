import Image from 'next/image'
import type { ReactNode } from 'react'

import { Line } from '@/components/motion/line'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/cn'
import type { ImageSource } from '@/lib/media'
import { internalPath } from '@/lib/urls'

/**
 * One yacht in the charter listing (issue #139, `docs/legacy-inventory.md` section 6): the
 * photograph, which grows a little under the pointer, the maker and the name over the hourly
 * price, and the six figures under the rule — the last two of them only where there is room.
 *
 * The figures arrive already printed, as the aircraft card's rows do (issue #99): the legacy
 * card wrote `guests`, `cabins` and `hours` in English on a site served in three languages and
 * spelled the Russian hours out in the component (section 10.4).
 *
 * The link carries the locale. The legacy card put the bare slug in `href`, which a browser
 * resolves against the page it is on, so every card on `/en/yachts` led to `/en/<slug>`
 * (section 3.3).
 */
export interface CharterYachtFigure {
  /** What the figure says, already in the language of the page. */
  text: string
  icon: ReactNode
}

export interface CharterYachtCardProps {
  /** The last segment of the yacht's own page; a listing without one is not a link. */
  slug?: string | null
  title: string
  /** `4,500 AED / per hour`, composed by the caller from the price and the currency. */
  price?: string
  photo: ImageSource | null
  figures: readonly CharterYachtFigure[]
  className?: string
}

export function CharterYachtCard({
  slug,
  title,
  price,
  photo,
  figures,
  className,
}: CharterYachtCardProps) {
  const content = (
    <>
      <div className="relative aspect-video overflow-hidden">
        {photo && (
          <Image
            alt={photo.alt === '' ? title : photo.alt}
            className="object-cover object-center transition-transform duration-300 ease-out group-hover:scale-125"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            src={photo.src}
          />
        )}
      </div>
      <div className="gap-3 p-6 pb-8">
        <h3>{title}</h3>
        {price !== undefined && price !== '' && (
          // The legacy badge asked for `rounded-md`, which pointed at an undefined variable and
          // rendered square (ADR-0006), so no radius class is ported.
          <span className="self-start bg-gold px-2 py-0.5 font-bold text-graphite-950">
            {price}
          </span>
        )}
        <Line />
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
          {figures.map((figure, index) => (
            <div
              key={figure.text}
              // The legacy card hid the last two below the wide breakpoint, where three columns
              // become two and the row would otherwise wrap.
              className={cn('flex-row items-center gap-2', index > 3 && 'hidden lg:flex')}
            >
              {figure.icon}
              <span>{figure.text}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
  const dress = cn(
    'group overflow-hidden rounded-2xl border border-graphite-800 bg-graphite-950 p-0',
    className,
  )

  return slug ? (
    <Link className={dress} href={internalPath(`/yachts/${slug}`)}>
      {content}
    </Link>
  ) : (
    <div className={dress}>{content}</div>
  )
}
