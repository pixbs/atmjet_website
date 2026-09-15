import Link from 'next/link'

import { Reveal } from '@/components/motion/reveal'
import { HeroFrame, HeroPhoto } from '@/components/sections/hero-frame'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/cn'
import type { ImageSource } from '@/lib/media'
import { heroHeadline } from '@/lib/motion'

/**
 * The yachts hero (issue #114, `docs/legacy-inventory.md` section 5): the heading arriving from
 * above, its paragraphs under it, and the call to action where the page asks for one.
 *
 * The words sit at the foot of the screen on a telephone and in the middle of it from the
 * medium breakpoint up, which is the whole of the difference from the sales hero.
 */
export interface HeroYachtsProps {
  overline: string
  title: string
  description: string
  description2?: string
  image: ImageSource
  /** Left out on the charter page, which showed no button (`isButtonHidden`). */
  action?: { label: string; href: string }
}

export function HeroYachts({
  overline,
  title,
  description,
  description2,
  image,
  action,
}: HeroYachtsProps) {
  return (
    <HeroFrame
      backdrop={<HeroPhoto alt={image.alt === '' ? title : image.alt} image={image} />}
      contentClassName="items-start justify-end pb-14 md:justify-center"
      section="hero-yachts"
    >
      <p className="text-sm uppercase">{overline}</p>
      <Reveal once variants={heroHeadline}>
        <h1>{title}</h1>
      </Reveal>
      <p className="max-w-lg pt-4 text-white">{description}</p>
      {description2 !== undefined && <p className="max-w-lg pt-4 text-white">{description2}</p>}
      {action !== undefined && (
        <Link
          className={cn(buttonVariants({ as: 'link', size: 'big' }), 'mt-8')}
          href={action.href}
          scroll={false}
        >
          {action.label}
        </Link>
      )}
      {/* Kept off the telephone, where the words already reach the foot of the screen. */}
      <p className="absolute bottom-8 left-5 z-20 hidden text-sm md:block">©ATM JET</p>
    </HeroFrame>
  )
}
