import Image from 'next/image'
import { Fragment } from 'react'

import { DiamondGold } from '@/components/icons'
import type { ImageSource } from '@/lib/media'

/**
 * The guide (issue #131, `docs/legacy-inventory.md` section 4): the page heading over two
 * columns, the points on the left under their own heading and the photograph on the right.
 */

/** What the legacy asked the optimiser for; `h-80 w-full` decides the box on screen. */
const PHOTO = { width: 2240, height: 1280 }

export interface GuideProps {
  title: string
  heading: string
  points: string[]
  image: ImageSource
}

export function Guide({ title, heading, points, image }: GuideProps) {
  return (
    <section data-section="guide">
      <div className="container gap-20 pt-32">
        <h1 className="text-center">{title}</h1>
        {/* `.container` is unlayered, but this row is a plain div, so no marker is needed. */}
        <div className="gap-10 lg:flex-row">
          <div className="w-full gap-6">
            <h2>{heading}</h2>
            {points.map((point, index) => (
              // A fragment rather than a wrapper: the rule and the point are siblings of the
              // heading on the legacy site, and a `div` between them would be a flex column.
              <Fragment key={point}>
                {index > 0 && <hr />}
                <div className="flex-row gap-4">
                  <DiamondGold className="size-11 shrink-0" />
                  <p>{point}</p>
                </div>
              </Fragment>
            ))}
          </div>
          {/* The first screen of the page, so it is fetched with the markup rather than lazily
              (section 13, entry 15). */}
          <Image
            alt={image.alt === '' ? title : image.alt}
            className="h-80 w-full rounded-2xl object-cover object-center"
            height={PHOTO.height}
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            src={image.src}
            width={PHOTO.width}
          />
        </div>
      </div>
    </section>
  )
}
