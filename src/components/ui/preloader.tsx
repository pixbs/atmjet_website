'use client'

import { m, useMotionValue, useReducedMotion } from 'motion/react'
import React, { useEffect, useState } from 'react'

import { Logo } from '@/components/icons'
import { setIntroStage } from '@/components/motion/intro'
import { cn } from '@/lib/cn'
import { curtainWindow, intro, preloaderLogo } from '@/lib/motion'

/**
 * The curtain the legacy site drew over the home page while it arrived (issue #92,
 * `docs/legacy-inventory.md` section 3.8), redrawn as an intro (section 13, entry 101): the
 * wordmark rises into its line and out of it, while a cabin window opens in the curtain and grows
 * to the screen, with the hero rising into place behind it.
 *
 * `aria-hidden` throughout: it is a curtain, and a screen reader should be reading the page
 * behind it, which the server has already sent. Under reduced motion it is not drawn at all.
 */
interface PreloaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Holds the first frame instead of playing it, for a fallback that may never be replaced. */
  isStatic?: boolean
}

/** The cabin window: its height against the screen's, capped by the width, and its shape. */
const CABIN = { height: 0.34, width: 0.42, ratio: 1.45, corner: 0.45 }

const px = (value: number) => Math.round(value * 10) / 10

/**
 * The curtain with a window cut out of its middle, as a clip path: until `intro.cabin` the
 * window opens to the shape of a cabin window, then it grows to the screen and its corners square
 * off, which leaves nothing of the curtain at `1`.
 */
function curtainAt(open: number): string {
  if (open <= 0) return 'none'

  const { innerWidth: width, innerHeight: height } = window
  const cabinHeight = Math.min(height * CABIN.height, width * CABIN.width * CABIN.ratio)
  const cabinWidth = cabinHeight / CABIN.ratio
  const opened = Math.min(1, open / intro.cabin)
  const grown = Math.max(0, (open - intro.cabin) / (1 - intro.cabin))

  const w = cabinWidth * opened + (width - cabinWidth) * grown
  const h = cabinHeight * opened + (height - cabinHeight) * grown
  const r = Math.min(cabinWidth * CABIN.corner * opened * (1 - grown), w / 2, h / 2)
  const x = (width - w) / 2
  const y = (height - h) / 2

  const screen = `M0 0H${width}V${height}H0Z`
  const hole = [
    `M${px(x + r)} ${px(y)}H${px(x + w - r)}`,
    `A${px(r)} ${px(r)} 0 0 1 ${px(x + w)} ${px(y + r)}V${px(y + h - r)}`,
    `A${px(r)} ${px(r)} 0 0 1 ${px(x + w - r)} ${px(y + h)}H${px(x + r)}`,
    `A${px(r)} ${px(r)} 0 0 1 ${px(x)} ${px(y + h - r)}V${px(y + r)}`,
    `A${px(r)} ${px(r)} 0 0 1 ${px(x + r)} ${px(y)}Z`,
  ].join('')

  return `path(evenodd, "${screen}${hole}")`
}

export function Preloader({ isStatic = false, className, ...props }: PreloaderProps) {
  const isCalm = useReducedMotion()
  // Decided in the browser: the server cannot know, so it sends the curtain closed either way.
  const plays = !isStatic && isCalm === false
  const clipPath = useMotionValue('none')
  const [isGone, setIsGone] = useState(false)

  useEffect(() => {
    if (!plays) return

    setIntroStage('covered')

    return () => setIntroStage('none')
  }, [plays])

  if (isGone) return null

  // The playing curtain is never drawn under reduced motion, from the first paint on.
  const layer = isStatic ? undefined : 'motion-reduce:hidden'

  return (
    <div aria-hidden className={cn('contents', className)} {...props}>
      <m.div
        animate={plays ? curtainWindow : undefined}
        className={cn('fixed inset-0 z-preloader-backdrop bg-graphite-950', layer)}
        data-testid="preloader-backdrop"
        onAnimationComplete={() => {
          setIsGone(true)
          setIntroStage('none')
        }}
        onUpdate={(latest) => {
          const open = Number(latest['--window'])

          clipPath.set(curtainAt(open))
          if (open >= intro.cabin) setIntroStage('opening')
        }}
        style={{ clipPath }}
      />
      <div
        className={cn('fixed inset-0 z-preloader flex items-center justify-center', layer)}
        data-testid="preloader-logo"
      >
        <m.div
          animate={plays ? 'visible' : undefined}
          initial={isStatic ? 'static' : 'hidden'}
          variants={preloaderLogo}
        >
          <Logo className="w-preloader-logo max-w-sm text-white" />
        </m.div>
      </div>
    </div>
  )
}
