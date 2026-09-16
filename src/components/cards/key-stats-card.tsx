import { Fragment, type ReactNode } from 'react'

import { Line } from '@/components/motion/line'
import { cn } from '@/lib/cn'

/**
 * The facts card a detail page carries beside its photographs (issue #140,
 * `docs/legacy-inventory.md` section 4): a heading and a grid of figures, each under its own
 * icon, with a rule between them.
 *
 * The rules are what make the grid read as rows. Every one of them spans the card, and the ones
 * after an even figure are hidden from the medium breakpoint up, which is where two figures
 * begin sharing a row: what is left is one rule under each pair.
 */
export interface KeyStat {
  icon: ReactNode
  /** Already printed, in the language of the page; a figure nobody filled in prints empty. */
  value: string
  label: string
}

export interface KeyStatsCardProps {
  title: string
  stats: readonly KeyStat[]
  /** Anything the card carries under the figures, such as what a charter includes. */
  children?: ReactNode
  /** Whether a rule follows the last figure, as the yacht page's card drew one. */
  ruleAfterLast?: boolean
}

export function KeyStatsCard({ title, stats, children, ruleAfterLast = false }: KeyStatsCardProps) {
  return (
    <div className="top-hero-band gap-10 rounded-3xl border border-graphite-800 bg-graphite-950 px-6 py-10 md:sticky md:self-start md:px-10 md:py-12 md:pb-14">
      <h2>{title}</h2>
      <div className="gap-6 sm:grid sm:grid-cols-2 md:gap-8">
        {stats.map((stat, index) => (
          <Fragment key={stat.label}>
            <div className="flex-row items-center gap-4">
              {stat.icon}
              <div>
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
              </div>
            </div>
            {(ruleAfterLast || index < stats.length - 1) && (
              <Line className={cn('col-span-full', index % 2 === 0 && 'md:hidden')} />
            )}
          </Fragment>
        ))}
        {children}
      </div>
    </div>
  )
}
