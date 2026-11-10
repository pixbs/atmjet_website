import { Arrive, SettleImage } from '@/components/motion/arrive'
import type { ImageSource } from '@/lib/media'

/**
 * The tiles grid (issue #122, `docs/legacy-inventory.md` section 5): photographs that arrive one
 * after another when the grid is scrolled to, and stay in once they have.
 *
 * The legacy scaled each tile in from nothing; here each is uncovered from its foot while the
 * photograph settles inside it, in the order the legacy staggered them (section 13, entry 101).
 * Each tile watches itself, which is the same thing as the legacy's one observer over the grid.
 */

/** What the legacy asked the optimiser for; the grid decides the box on screen. */
const TILE = { width: 400, height: 400 }

/** Seconds between one tile arriving and the next. */
const STAGGER = 0.08

export function Tiles({ tiles }: { tiles: ImageSource[] }) {
  return (
    <section data-section="tiles">
      {/* `.container` is an unlayered parity rule, so its `flex` beats a plain `grid`, which is
          why the legacy marked this one important too (docs/adr/0006-styling-and-motion.md). */}
      <div className="container grid! grid-cols-2 md:grid-cols-3" data-tiles="">
        {tiles.map((image, index) => (
          // Clipped, so the photograph settling from large stays inside the tile it fills.
          <Arrive
            key={image.src + index}
            className="relative overflow-hidden"
            variant="fadeIn"
            wait={index * STAGGER}
          >
            <SettleImage
              alt={image.alt}
              className="object-cover"
              height={TILE.height}
              sizes="(min-width: 768px) 30vw, 45vw"
              src={image.src}
              wait={index * STAGGER}
              width={TILE.width}
            />
          </Arrive>
        ))}
      </div>
    </section>
  )
}
