import type { ReactNode } from 'react'

import { Arrive } from '@/components/motion/arrive'
import { cn } from '@/lib/cn'

/**
 * One privilege of flying with the company, as the privileges section stacks them (issue #103,
 * `docs/legacy-inventory.md` section 5): an icon beside a gold heading and a paragraph, on a
 * panel that sticks under the one before it as the section scrolls past.
 *
 * The card holds the sticking; where each one stops is the section's to decide and arrives as
 * `top`, because it depends on how many cards there are (E7.10). It rises into the stack with
 * its gold heading drawn from left to right (section 13, entry 101).
 */

/** The gold gradient, painted through the letters. */
const HEADING = 'bg-gold bg-clip-text font-serif text-transparent'

export interface PrivilegeCardProps {
  /** Rendered as given, so the section decides the icon and its size. */
  icon: ReactNode
  title: string
  description: string
  /** How far down the viewport the card comes to rest, in pixels. */
  top: number
  className?: string
}

export function PrivilegeCard({ icon, title, description, top, className }: PrivilegeCardProps) {
  return (
    <Arrive
      className={cn(
        'card sticky -mb-16 gap-4 overflow-hidden bg-graphite-950/90 p-8 pb-24 backdrop-blur-lg last:mb-0 last:pb-14 md:flex-row',
        className,
      )}
      // The offset is per card and counted from the ones above it, so it cannot be a class.
      style={{ top }}
    >
      {icon}
      <div className="gap-4 md:w-full">
        <Arrive as="h3" className={HEADING} variant="gild" wait={0.15}>
          {title}
        </Arrive>
        <Arrive as="p" wait={0.3}>
          {description}
        </Arrive>
      </div>
    </Arrive>
  )
}
