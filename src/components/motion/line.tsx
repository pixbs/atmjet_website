'use client'

import { m } from 'motion/react'

import { cn } from '@/lib/cn'
import { inViewOnce, inViewRepeat, transition } from '@/lib/motion'

/**
 * The hairline separator that draws itself when it scrolls into view, over a second, every
 * time it comes back (issue #50; the legacy Line used the same timing and no `once`).
 */
export function Line({
  isVertical = false,
  once = false,
  className,
}: {
  isVertical?: boolean
  /** Draw only the first time; the legacy separators redrew on every pass. */
  once?: boolean
  className?: string
}) {
  return (
    <m.div
      aria-hidden
      className={cn(isVertical ? 'w-px' : 'h-px', 'bg-graphite-800', className)}
      initial={isVertical ? { height: 0 } : { width: 0 }}
      whileInView={isVertical ? { height: '100%' } : { width: '100%' }}
      viewport={once ? inViewOnce : inViewRepeat}
      transition={transition.line}
    />
  )
}
