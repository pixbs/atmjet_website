import Image from 'next/image'

import { buttonVariants } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/cn'
import type { ImageSource } from '@/lib/media'

/**
 * The options tiles (issue #119, `docs/legacy-inventory.md` section 5): two photographs side by
 * side, each with a heading and the way through to a page, under the darkening overlay the
 * parity layer draws.
 *
 * The legacy put a `<button>` inside the link that wraps the whole tile, which is interactive
 * content inside interactive content; here the label wears the button instead (issue #262).
 */

/** The tile itself, and the row it sits in. */
const TILE =
  'relative h-80 w-full items-start justify-center gap-6 overflow-hidden rounded-2xl p-12'

export interface OptionsTile {
  image: ImageSource
  title: string
  label: string
  href: string
  /** The second legacy tile carried an extra wash over its photograph. */
  dim?: boolean
}

export function OptionsTiles({ tiles }: { tiles: OptionsTile[] }) {
  return (
    <section data-section="options-tiles">
      {/* `.container` is an unlayered parity rule, so its `flex-col` beats a plain
          `lg:flex-row` exactly as it did on the legacy site (docs/adr/0006-styling-and-motion.md). */}
      <div className="container gap-6 py-10 lg:flex-row! lg:content-stretch">
        {tiles.map((tile) => (
          <div key={tile.href + tile.title} className={TILE}>
            <Link
              className="z-10 flex h-full flex-col items-start justify-between gap-8"
              href={tile.href}
            >
              <h2 className="z-10">{tile.title}</h2>
              <span className={buttonVariants({ as: 'link' })}>{tile.label}</span>
            </Link>
            {tile.dim && <div className="absolute inset-0 -z-10 bg-graphite-900 opacity-60" />}
            <div className={cn('option-darkening absolute inset-0', tile.dim && '-z-10')} />
            <Image
              alt={tile.image.alt}
              className={cn('object-cover object-center', tile.dim ? '-z-20' : '-z-10')}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              src={tile.image.src}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
