import { RequestForm } from '@/components/form/request-form'
import type { Locale } from '@/i18n/locales'
import { cn } from '@/lib/cn'

/**
 * The booking invitation (issue #115, `docs/legacy-inventory.md` section 5): the heading over
 * the flight request form, either plainly or inside a card.
 *
 * A server shell around the one client island the form is, as the legacy section was. The
 * legacy class list read `gap-8 false` when it was not a card (section 5), which matched no
 * rule and drew nothing, so the `false` is left behind.
 */
export function MakeBooking({
  title,
  variant,
  locale,
}: {
  title: string
  variant: 'plain' | 'card'
  locale: Locale
}) {
  return (
    <section data-section="make-booking" data-variant={variant}>
      <div className="container py-12">
        <div className={cn('gap-8', variant === 'card' && 'rounded-2xl bg-graphite-850 p-8')}>
          <h2>{title}</h2>
          <RequestForm locale={locale} />
        </div>
      </div>
    </section>
  )
}
