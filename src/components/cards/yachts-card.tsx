import Image from 'next/image'

import { Reveal } from '@/components/motion/reveal'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/cn'
import type { ImageSource } from '@/lib/media'
import { internalPath } from '@/lib/urls'

/**
 * The yachts promotion, as the home page and `/atm_jet_group` carry it (issue #103,
 * `docs/legacy-inventory.md` section 6): a wide photograph, what the fleet offers in three
 * columns, and a second card inside it with the invitation and the way through to the yachts.
 *
 * Each part reveals on scroll as the legacy card did (issue #50), and the invitation links
 * through `Link`, so it lands on `/en/yachts` rather than on the redirect the legacy relied on
 * (section 3.3).
 */

/** What the legacy asked the optimiser for; the classes beside each decide the box on screen. */
const BANNER = { width: 1200, height: 255 }
const INVITATION = { width: 1100, height: 400 }

export interface YachtsCardColumn {
  title: string
  description: string
}

export interface YachtsCardProps {
  image: ImageSource
  columns: readonly YachtsCardColumn[]
  /** The card inside the card: a picture, the invitation and the button under it. */
  invitation: {
    image: ImageSource
    title: string
    action: { label: string; href: string }
  }
  className?: string
}

export function YachtsCard({ image, columns, invitation, className }: YachtsCardProps) {
  return (
    <Reveal className={cn('gap-10 overflow-hidden rounded-2xl bg-graphite-950', className)}>
      <Image
        alt={image.alt}
        className="min-h-64 object-cover object-center"
        height={BANNER.height}
        src={image.src}
        width={BANNER.width}
      />
      <div className="gap-8 px-6 md:flex-row">
        {columns.map((column) => (
          <Reveal key={column.title} className="w-full gap-3">
            <h3>{column.title}</h3>
            <p>{column.description}</p>
          </Reveal>
        ))}
      </div>
      <Reveal className="mx-6 mb-6 gap-4 overflow-hidden rounded-2xl bg-graphite-900 md:text-center">
        <Image
          alt={invitation.image.alt}
          className="mx-auto aspect-banner w-full object-cover object-center"
          height={INVITATION.height}
          src={invitation.image.src}
          width={INVITATION.width}
        />
        <div className="gap-6 p-6">
          <h3>{invitation.title}</h3>
          <Link href={internalPath(invitation.action.href)}>
            <button className="md:self-center md:px-8" type="button">
              {invitation.action.label}
            </button>
          </Link>
        </div>
      </Reveal>
    </Reveal>
  )
}
