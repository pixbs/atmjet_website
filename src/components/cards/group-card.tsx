import Image from 'next/image'

import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/cn'
import type { ImageSource } from '@/lib/media'
import { internalPath } from '@/lib/urls'

/**
 * One arm of the group, as `/atm_jet_group` lists them (issue #103,
 * `docs/legacy-inventory.md` section 6): a photograph with the copy laid over it and a button
 * into that part of the site, the picture fading out under the text on a wide screen.
 *
 * Two things changed, neither of them visible:
 *
 * - The link lands where it says. The legacy card built `/${locale}/${href}` around an href that
 *   already began with a slash, so both cards linked to `/en//aircraft` (section 13, entry 9);
 *   the path goes through `internalPath` and `Link` adds the locale.
 * - The photograph is an `<Image>` rather than a CSS `background-image`, so it is served at the
 *   size the screen asks for and after the copy — the same treatment the legacy gave the
 *   identical tiles on the home page (E11.7).
 */

/** The gradient that fades the photograph out under the copy, kept stop for stop. */
const VEIL =
  'absolute inset-0 bg-linear-to-r from-graphite-950 via-graphite-950 to-graphite-950/80 md:from-0% md:via-40% md:to-transparent'

export interface GroupCardProps {
  title: string
  description: string
  image: ImageSource
  /** The wording of the button and the path it opens, without a locale. */
  action: { label: string; href: string }
  className?: string
}

export function GroupCard({ title, description, image, action, className }: GroupCardProps) {
  return (
    <div className={cn('relative w-full p-8 md:flex-row md:p-10', className)}>
      {/* The card is as wide as the page gutter allows, which the legacy capped at 1280px. */}
      <Image
        alt={image.alt}
        className="object-cover object-center"
        fill
        sizes="(min-width: 1280px) 1280px, 100vw"
        src={image.src}
      />
      <div className="z-10">
        <h2>{title}</h2>
        <p className="pt-3">{description}</p>
        <Link href={internalPath(action.href)}>
          <button className="mt-6" type="button">
            {action.label}
          </button>
        </Link>
      </div>
      <div className={VEIL} />
    </div>
  )
}
