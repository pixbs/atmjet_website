import Image from 'next/image'
import Link from 'next/link'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/cn'
import type { ImageSource } from '@/lib/media'

/**
 * The best price section (issue #125, `docs/legacy-inventory.md` section 5): the gold heading
 * and its sentence on one side of a card, the photograph on the other, and the call to action
 * under the words. Below the large breakpoint the picture comes first, as it did there.
 *
 * The legacy wrapped a `<button>` in the link, which is markup a browser cannot nest; the link
 * wears the button's clothes instead and renders the same (issue #262).
 */

/** What the legacy asked the optimiser for; `h-80` decides the box on screen. */
const PHOTO = { width: 600, height: 320 }

export interface BestPriceProps {
  title: string
  description: string
  image: ImageSource
  /** The wording of the button, and the query that opens the booking dialog of E6.6. */
  action: { label: string; href: string }
}

export function BestPrice({ title, description, image, action }: BestPriceProps) {
  return (
    <section data-section="best-price">
      <div className="container">
        <div className="card flex-col-reverse items-center bg-graphite-950 lg:flex-row">
          <div className="p-8 md:p-10">
            <h2 className="bg-gold bg-clip-text text-transparent">{title}</h2>
            <p className="mt-4">{description}</p>
            <Link
              className={cn(buttonVariants({ as: 'link', size: 'big' }), 'mt-10 md:self-start')}
              href={action.href}
              scroll={false}
            >
              {action.label}
            </Link>
          </div>
          <Image
            alt={image.alt === '' ? title : image.alt}
            className="h-80 w-full rounded-2xl object-cover object-center"
            height={PHOTO.height}
            sizes="(min-width: 1024px) 50vw, 100vw"
            src={image.src}
            width={PHOTO.width}
          />
        </div>
      </div>
    </section>
  )
}
