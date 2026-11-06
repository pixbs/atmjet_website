import { Arrive, RiseText, SettleImage } from '@/components/motion/arrive'
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
 *
 * Each tile rises in, the second just after the first, with its photograph uncovered and
 * settling inside it; being a way through, it leans in under the pointer (section 13, entry 101).
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
        {tiles.map((tile, index) => (
          <Arrive key={tile.href + tile.title} className={TILE} hover wait={index * 0.12}>
            <Link
              className="z-10 flex h-full flex-col items-start justify-between gap-8"
              href={tile.href}
            >
              <RiseText className="z-10" wait={0.2 + index * 0.12}>
                {tile.title}
              </RiseText>
              <span className={buttonVariants({ as: 'link' })}>{tile.label}</span>
            </Link>
            {tile.dim && <div className="absolute inset-0 -z-10 bg-graphite-900 opacity-60" />}
            <div className={cn('option-darkening absolute inset-0', tile.dim && '-z-10')} />
            <SettleImage
              alt={tile.image.alt}
              className={cn('object-cover object-center', tile.dim ? '-z-20' : '-z-10')}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              src={tile.image.src}
            />
          </Arrive>
        ))}
      </div>
    </section>
  )
}
