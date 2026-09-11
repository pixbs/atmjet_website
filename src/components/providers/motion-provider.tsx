'use client'

import { LazyMotion, MotionConfig, domAnimation } from 'motion/react'
import type { ReactNode } from 'react'

/**
 * Single entry point for animation (docs/adr/0006-styling-and-motion.md).
 *
 * - `LazyMotion` loads the animation features once; `strict` throws when a
 *   component imports `motion.*` instead of the lightweight `m.*`, which keeps
 *   the feature bundle out of the initial payload.
 * - `reducedMotion="user"` honours the OS setting and lets visual tests run
 *   deterministically with Playwright's `reducedMotion: 'reduce'`.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  )
}
