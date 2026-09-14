'use client'

import { m } from 'motion/react'
import React from 'react'

import { Logo } from '@/components/icons'
import { cn } from '@/lib/cn'
import { preloaderBackdrop, preloaderLogo } from '@/lib/motion'

/**
 * The screen the legacy site showed while the home page arrived (issue #92,
 * `docs/legacy-inventory.md` section 3.8): the wordmark drops in over a dark backdrop, holds,
 * leaves upwards, and the backdrop collapses behind it.
 *
 * Two layers rather than one, as the legacy had: the backdrop outlives the logo by half a
 * second, so they cannot share a transition. The keyframes and their timings are the shared
 * vocabulary's (`src/lib/motion.ts`), measured from the legacy site.
 *
 * `aria-hidden` throughout: it is a curtain, and a screen reader should be reading the page
 * behind it, which the server has already sent.
 */
interface PreloaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Holds the first frame instead of playing it, for a fallback that may never be replaced. */
  isStatic?: boolean
}

export function Preloader({ isStatic = false, className, ...props }: PreloaderProps) {
  const state = isStatic ? 'static' : 'visible'

  return (
    <div aria-hidden className={cn('contents', className)} {...props}>
      <m.div
        data-testid="preloader-backdrop"
        className="fixed inset-0 z-preloader-backdrop items-center justify-center bg-graphite-950"
        variants={preloaderBackdrop}
        initial="hidden"
        animate={state}
      />
      <m.div
        className="fixed inset-0 z-preloader flex items-center justify-center"
        variants={preloaderLogo}
        initial="hidden"
        animate={state}
      >
        <Logo className="w-preloader-logo max-w-sm text-white" />
      </m.div>
    </div>
  )
}
