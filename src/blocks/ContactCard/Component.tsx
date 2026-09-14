import Image from 'next/image'
import Link from 'next/link'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/cn'
import type { ImageSource } from '@/lib/media'

/**
 * The contact card (issue #133, `docs/legacy-inventory.md` section 4): the words on the left of
 * a photograph that is darkened towards them until they can be read.
 *
 * The gradient is drawn three times over, as the legacy drew it: one pass leaves the left of
 * the picture too light to read the heading against.
 */

/** The three passes of the gradient, and the flat panel a telephone gets instead. */
const DARKENING = 'option-darkening absolute inset-0 -z-10'

export interface ContactCardProps {
  title: string
  description: string
  image: ImageSource
  /** The wording of the button, and the query that opens the booking dialog of E6.6. */
  action: { label: string; href: string }
}

export function ContactCard({ title, description, image, action }: ContactCardProps) {
  return (
    <section data-section="contact-card">
      <div className="container gap-10">
        <div className="card relative gap-4 overflow-clip p-12 md:p-24">
          <h2>{title}</h2>
          <p className="md:w-1/2">{description}</p>
          <Link
            className={cn(buttonVariants({ as: 'link' }), 'mt-4 self-start')}
            href={action.href}
            scroll={false}
          >
            {action.label}
          </Link>
          <div className={DARKENING} />
          <div className={DARKENING} />
          <div className={DARKENING} />
          {/* The picture is too light to read the words against on a narrow screen, where the
              gradient has no room to darken; the legacy laid a flat panel over it instead. */}
          <div className="absolute inset-0 -z-10 bg-graphite-900 opacity-80 md:hidden" />
          {/* The legacy carried a `fixed` class here, which pinned the picture to the screen
              rather than to the card; under this version of `next/image` the class is inert,
              so the picture stays in the card it belongs to (issue #303). */}
          <Image
            alt={image.alt === '' ? title : image.alt}
            className="-z-20 rounded-xl object-cover"
            fill
            sizes="(min-width: 1280px) 1280px, 100vw"
            src={image.src}
          />
        </div>
      </div>
    </section>
  )
}
