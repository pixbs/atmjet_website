import Link from 'next/link'

import { Counter } from '@/components/motion/counter'
import { Reveal } from '@/components/motion/reveal'
import { cn } from '@/lib/cn'
import {
  departureLabel,
  discountLabel,
  priceLabel,
  regularPriceLabel,
  routeEndLabel,
} from '@/lib/empty-leg'

/**
 * One repositioning flight, as the empty legs section lists them (issue #104,
 * `docs/legacy-inventory.md` section 6): the day it leaves and a booking button on one line, the
 * price with what a charter would cost struck through beside it, and the route underneath.
 *
 * The card is server-rendered. Only the reveal and the counting are client leaves, and both
 * already exist as primitives (issue #50); the legacy card was a client component that also
 * declared itself `async`, which React does not support.
 *
 * The copy on the button comes from the caller, because it is content: the message catalogue it
 * lived in is migrated by E10.1.
 */

/** One end of the route. The code is kept even when no airport matched it (E4.7). */
export interface RouteEnd {
  icao: string
  airport?: string | null
}

export interface EmptyLegCardProps {
  departureAt: string | Date
  /** Absent on a leg the legacy admin never priced; the card says so rather than showing zero. */
  price?: number | null
  currency?: string
  from: RouteEnd
  to: RouteEnd
  /** The wording of the booking button, and where it goes. */
  booking: { label: string; href: string }
  /** What to print instead of a price that is not there. */
  noPriceLabel: string
  className?: string
}

export function EmptyLegCard({
  departureAt,
  price,
  currency = 'USD',
  from,
  to,
  booking,
  noPriceLabel,
  className,
}: EmptyLegCardProps) {
  const hasPrice = typeof price === 'number'

  return (
    <Reveal className={cn('gap-3 bg-graphite-900 p-6', className)}>
      <div className="flex-row justify-between">
        <p className="text-sm">{departureLabel(departureAt)}</p>
        {/* The caller builds the href, because a query-only link needs the page it sits on
            and this card is rendered on the server. `next/link` rather than the locale-aware
            one: the path it is given already carries the prefix. */}
        <Link href={booking.href} scroll={false}>
          <button type="button">{booking.label}</button>
        </Link>
      </div>
      <div className="flex-row items-start gap-2">
        <Counter className="font-sans text-3xl font-black text-white">
          {hasPrice ? priceLabel(price, currency) : noPriceLabel}
        </Counter>
        {hasPrice && (
          <>
            <p className="text-xs line-through">{regularPriceLabel(price, currency)}</p>
            {/* `rounded-lg` pointed at a variable that was never defined, so the badge is square. */}
            <p className="bg-red-500 px-1 text-xs font-bold text-white">{discountLabel()}</p>
          </>
        )}
      </div>
      <div className="flex-row gap-4">
        <p>{routeEndLabel(from.icao, from.airport)}</p>
        <p>{' -> '}</p>
        <p>{routeEndLabel(to.icao, to.airport)}</p>
      </div>
    </Reveal>
  )
}
