import { Arrive, RiseText, UnveilImage } from '@/components/motion/arrive'
import { buttonVariants } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/cn'
import type { ImageSource } from '@/lib/media'
import { internalPath } from '@/lib/urls'

/**
 * The yachts promotion, as the home page and `/atm_jet_group` carry it (issue #103,
 * `docs/legacy-inventory.md` section 6): a wide photograph, what the fleet offers in three
 * columns, and a second card inside it with the invitation and the way through to the yachts.
 *
 * Each part arrives on scroll, once (section 13, entry 101): the card rises with its photograph
 * uncovered, the columns follow one after another, then the invitation. The invitation links
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
    <Arrive className={cn('gap-10 overflow-hidden rounded-2xl bg-graphite-950', className)}>
      <UnveilImage
        alt={image.alt}
        className="min-h-64 object-cover object-center"
        height={BANNER.height}
        sizes="90vw"
        src={image.src}
        wait={0.1}
        width={BANNER.width}
      />
      <div className="gap-8 px-6 md:flex-row">
        {columns.map((column, index) => (
          <Arrive key={column.title} className="w-full gap-3" wait={index * 0.12}>
            <RiseText as="h3" wait={0.1 + index * 0.12}>
              {column.title}
            </RiseText>
            <p>{column.description}</p>
          </Arrive>
        ))}
      </div>
      <Arrive className="mx-6 mb-6 gap-4 overflow-hidden rounded-2xl bg-graphite-900 md:text-center">
        <UnveilImage
          alt={invitation.image.alt}
          className="mx-auto aspect-banner w-full object-cover object-center"
          height={INVITATION.height}
          sizes="90vw"
          src={invitation.image.src}
          wait={0.1}
          width={INVITATION.width}
        />
        <div className="gap-6 p-6">
          <RiseText as="h3" wait={0.25}>
            {invitation.title}
          </RiseText>
          <Link
            className={cn(buttonVariants({ as: 'link' }), 'self-start md:self-center md:px-8')}
            href={internalPath(invitation.action.href)}
          >
            {invitation.action.label}
          </Link>
        </div>
      </Arrive>
    </Arrive>
  )
}
