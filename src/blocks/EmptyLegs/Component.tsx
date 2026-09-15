import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'

import { EmptyLegCard } from '@/components/cards/empty-leg-card'
import { buttonVariants } from '@/components/ui/button'
import type { Locale } from '@/i18n/locales'
import { cn } from '@/lib/cn'
import { listEmptyLegs } from '@/lib/data/empty-legs'
import { getTelegramChannel } from '@/lib/data/site-settings'

/**
 * The empty legs section (issue #117, `docs/legacy-inventory.md` section 5): the heading that
 * stands still beside the flights while they scroll past it, and under them the card inviting a
 * visitor to the channel the new ones are posted to.
 *
 * The flights are read here rather than handed in, because they are documents and not fields:
 * the block passes the wording an editor keeps and the section asks the collection for the rest,
 * on the server (ADR-0007).
 */
export interface EmptyLegsProps {
  title: string
  description: string
  /** How many flights to list, lowest `order` first. */
  limit: number
  /** The wording of the button on every card, and the query that opens the booking dialog. */
  booking: { label: string; href: string }
  /** The card under the flights. Where its button leads is the site settings' channel. */
  channel: { title: string; description: string; label: string }
}

export async function EmptyLegs({ title, description, limit, booking, channel }: EmptyLegsProps) {
  // The page has already refused a locale the site does not serve.
  const locale = (await getLocale()) as Locale
  const [legs, channelHref, t] = await Promise.all([
    listEmptyLegs(locale, limit),
    getTelegramChannel(),
    getTranslations({ locale, namespace: 'common' }),
  ])

  return (
    <section className="bg-graphite-950" data-section="empty-legs">
      {/* `.container` is an unlayered parity rule, so its `flex-col` beats a plain `lg:flex-row`
          exactly as it did on the legacy site; the marker is how the Navbar turns the same row
          on (docs/adr/0006-styling-and-motion.md). */}
      <div className="container gap-8 py-10 lg:flex-row!">
        <div className="top-40 min-w-40 shrink-0 gap-4 self-start lg:sticky lg:w-72">
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        {/* The width the legacy column never needed, because its container never became a row. */}
        <div className="w-full gap-4">
          {legs.map((leg) => (
            <EmptyLegCard
              key={leg.id}
              booking={booking}
              currency={leg.currency}
              departureAt={leg.departureAt}
              from={leg.from}
              noPriceLabel={t('notAvailable')}
              price={leg.price}
              to={leg.to}
            />
          ))}
          {/* The legacy card also carried `border-0`, which never took effect: `.card` is
              unlayered and beats a utility, there as here (docs/adr/0006-styling-and-motion.md).
              `md:bg-fixed` does take effect, pinning the gradient to the screen (section 12.4). */}
          <div className="card mt-4 items-start gap-4 bg-linear-to-b from-graphite-850 from-15% to-teal-950 p-6 md:bg-fixed">
            <h3>{channel.title}</h3>
            <p className="text-white">{channel.description}</p>
            {channelHref !== '' && (
              <Link
                className={cn(
                  buttonVariants({ as: 'link', size: 'big' }),
                  'mt-2 bg-blue-600 text-white',
                )}
                href={channelHref}
              >
                {channel.label}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
