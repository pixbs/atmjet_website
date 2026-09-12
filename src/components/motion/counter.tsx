'use client'

import { m, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

import {
  COUNT_INTERVAL_MS,
  countValues,
  formatCount,
  isCountDone,
  parseCountTargets,
} from '@/lib/count-up'
import { counterReveal } from '@/lib/motion'

/**
 * Counts the numbers inside its label up from zero when it scrolls into view, and resets when
 * it leaves, as the legacy Counter did (issue #50). `useInView` replaces the legacy
 * react-intersection-observer (ADR-0006). With reduced motion the final label is shown at once.
 */
export function Counter({ children, className }: { children: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref)
  const reducedMotion = useReducedMotion()
  // Only the timer writes here; everything else is derived, so the label falls back to the
  // final text whenever the counter is out of view, done, or motion is reduced.
  const [counted, setCounted] = useState<string | null>(null)
  const counting = inView && !reducedMotion
  const label = counting && counted !== null ? counted : children

  useEffect(() => {
    if (!counting) return

    const targets = parseCountTargets(children)
    if (targets.length === 0) return

    let step = 0
    const timer = setInterval(() => {
      step += 1
      const values = countValues(targets, step)

      if (isCountDone(values, targets)) {
        setCounted(null)
        clearInterval(timer)
        return
      }

      setCounted(formatCount(children, values))
    }, COUNT_INTERVAL_MS)

    return () => clearInterval(timer)
  }, [children, counting])

  return (
    <m.span
      ref={ref}
      className={className}
      variants={counterReveal}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
    >
      {label}
    </m.span>
  )
}
