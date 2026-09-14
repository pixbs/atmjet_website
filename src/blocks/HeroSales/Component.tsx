import Link from 'next/link'
import { Fragment } from 'react'

import { Counter } from '@/components/motion/counter'
import { Reveal } from '@/components/motion/reveal'
import { HeroFrame } from '@/components/sections/hero-frame'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/cn'
import type { ImageSource } from '@/lib/media'
import { heroHeadline } from '@/lib/motion'

/**
 * The sales department hero (issue #113, `docs/legacy-inventory.md` section 5): the headline
 * arriving from above with its figures counting up from zero, and the call to action under it.
 *
 * `heroHeadline` is the legacy `animate-in fade-in slide-in-from-top-10 duration-1000` measured
 * into the shared vocabulary (ADR-0006), run once on arrival as the legacy CSS animation was.
 */
export interface HeroSalesProps {
  overline: string
  lines: { figure: string; text: string }[]
  description: string
  image: ImageSource
  /** The wording of the button, and the query that opens the booking dialog of E6.6. */
  action: { label: string; href: string }
}

export function HeroSales({ overline, lines, description, image, action }: HeroSalesProps) {
  return (
    <HeroFrame
      alt={image.alt === '' ? overline : image.alt}
      contentClassName="justify-center"
      image={image}
      section="hero-sales"
    >
      <p className="text-sm uppercase">{overline}</p>
      <Reveal once variants={heroHeadline}>
        <h1>
          {lines.map((line, index) => (
            <Fragment key={line.text}>
              {index > 0 && <br />}
              <Counter className="bg-gold bg-clip-text text-transparent md:bg-fixed">
                {line.figure}
              </Counter>{' '}
              {line.text}
            </Fragment>
          ))}
        </h1>
      </Reveal>
      {/* The legacy broke this sentence on its own newlines and drew each line in turn. */}
      <p className="max-w-xs pt-4 whitespace-pre-line text-white">{description}</p>
      <Link
        className={cn(buttonVariants({ as: 'link', size: 'big' }), 'mt-8')}
        href={action.href}
        scroll={false}
      >
        {action.label}
      </Link>
      <p className="absolute bottom-8 left-5 z-20 text-sm">©ATM JET</p>
    </HeroFrame>
  )
}
