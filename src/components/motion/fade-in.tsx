'use client'

import { m } from 'motion/react'
import type { ReactNode } from 'react'

import { fade } from '@/lib/motion'

/**
 * Fades its children in as they arrive, which is the legacy `animate-in fade-in` (issue #89,
 * `docs/legacy-inventory.md` section 3.4). `Reveal` is the other half of the pair and waits for
 * the scroll; this one does not, because the legacy class did not either — a footer link on the
 * second row would otherwise stay invisible until somebody scrolled to it.
 */
export function FadeIn({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <m.div animate="visible" className={className} initial="hidden" variants={fade}>
      {children}
    </m.div>
  )
}
