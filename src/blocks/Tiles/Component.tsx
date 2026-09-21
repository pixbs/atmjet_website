import Image from 'next/image'

import { Reveal } from '@/components/motion/reveal'
import { tile } from '@/lib/motion'
import type { ImageSource } from '@/lib/media'

/**
 * The tiles grid (issue #122, `docs/legacy-inventory.md` section 5): photographs that scale in
 * one after another when the grid is scrolled to, and stay in once they have.
 *
 * The legacy watched the grid with `react-intersection-observer` and animated every tile from
 * that one reading; here each tile watches itself through `whileInView`, which is the same
 * thing with no observer to wire up (ADR-0006), and keeps the stagger by index.
 */

/** What the legacy asked the optimiser for; the grid decides the box on screen. */
const TILE = { width: 400, height: 400 }

export function Tiles({ tiles }: { tiles: ImageSource[] }) {
  return (
    <section data-section="tiles">
      {/* `.container` is an unlayered parity rule, so its `flex` beats a plain `grid`, which is
          why the legacy marked this one important too (docs/adr/0006-styling-and-motion.md). */}
      <div className="container grid! grid-cols-2 md:grid-cols-3" data-tiles="">
        {tiles.map((image, index) => (
          <Reveal key={image.src + index} className="relative" once variants={tile(index)}>
            <Image
              alt={image.alt}
              className="object-cover"
              height={TILE.height}
              sizes="(min-width: 768px) 30vw, 45vw"
              src={image.src}
              width={TILE.width}
            />
          </Reveal>
        ))}
      </div>
    </section>
  )
}
