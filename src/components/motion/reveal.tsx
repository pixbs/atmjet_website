'use client'

import { m, type Variants } from 'motion/react'
import type { CSSProperties, ReactNode } from 'react'

import { cardReveal, inViewOnce, inViewRepeat } from '@/lib/motion'

/**
 * Reveals its children when they scroll into view (issue #50). The legacy cards re-ran their
 * reveal every time they came back, which is the default here; `once` is for the sections that
 * used `triggerOnce` (tiles, contact blocks).
 */
export function Reveal({
  children,
  className,
  style,
  variants = cardReveal,
  once = false,
}: {
  children: ReactNode
  className?: string
  /** For what a class cannot say: the offset a card in a sticky stack comes to rest at. */
  style?: CSSProperties
  variants?: Variants
  once?: boolean
}) {
  return (
    <m.div
      className={className}
      style={style}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={once ? inViewOnce : inViewRepeat}
    >
      {children}
    </m.div>
  )
}
