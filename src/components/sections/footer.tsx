import NextLink from 'next/link'
import { getTranslations } from 'next-intl/server'

import { ArrowTopRight, Logo } from '@/components/icons'
import { Arrive, SettleImage } from '@/components/motion/arrive'
import { LocaleSwitch } from '@/components/ui/locale-switch'
import type { Locale } from '@/i18n/locales'
import { Link } from '@/i18n/navigation'
import { getFooterNav } from '@/lib/data/footer'
import { getSocialLinks } from '@/lib/data/site-settings'
import type { NavLink } from '@/lib/nav'

/**
 * The foot of every page (issue #89, `docs/legacy-inventory.md` section 3.4): the wordmark and
 * the language links over two rows of pages, the ways to reach ATM JET beside them, the booking
 * button and the legal lines, all on a photograph the page ends on.
 *
 * Everything it shows is read here, on the server, from the Footer global and the site settings;
 * the legacy footer hard-coded its twelve links, its three accounts and both legal lines, which
 * is how the site came to carry a Telegram link no browser could open (section 9.5). The client
 * code is the language switcher, which reads the URL it is on, and the arrival: as the foot is
 * reached the photograph is uncovered and settles, and the panel rises with its links coming in
 * one after another (section 13, entry 101).
 */

/** Seconds between one link arriving and the next. */
const STAGGER = 0.05

/** A row of page links, arriving one after another. */
function Column({ links }: { links: NavLink[] }) {
  return (
    <div>
      {links.map((link, index) => (
        <Arrive key={link.href} wait={0.15 + index * STAGGER}>
          <Link href={link.href}>{link.label}</Link>
        </Arrive>
      ))}
    </div>
  )
}

export async function Footer({
  locale,
  locales,
}: {
  locale: Locale
  /** The languages the site serves, from `SiteSettings` (issue #53). */
  locales: readonly Locale[]
}) {
  const [footer, hrefs, t] = await Promise.all([
    getFooterNav(locale),
    getSocialLinks(),
    getTranslations({ locale, namespace: 'social' }),
  ])

  const social = footer.socials.flatMap((network) =>
    hrefs[network] === '' ? [] : [{ label: t(network), href: hrefs[network] }],
  )
  // The legacy line carried the year as a placeholder the message catalogue filled in.
  const copyright = footer.legal?.copyright.replace('{year}', String(new Date().getFullYear()))

  return (
    <section className="overflow-hidden" data-section="footer">
      {footer.background && (
        // The box the photograph settles inside, at the depth the photograph itself sat at.
        <Arrive className="absolute inset-0 -z-50 overflow-hidden" variant="fadeIn">
          <SettleImage
            alt={footer.background.alt}
            className="object-cover object-center"
            fill
            // The last thing on the page, so it is fetched when it is reached, as the legacy did.
            loading="lazy"
            sizes="100vw"
            src={footer.background.src}
          />
        </Arrive>
      )}
      {/* `.container` is an unlayered parity rule, so its position and margins need the
          important marker, exactly as the legacy `!static !mb-0 !mt-24` did. */}
      <Arrive
        as="footer"
        className="static! container mt-24! mb-0! gap-8 rounded-t-2xl bg-graphite-900/60 py-10 backdrop-blur-lg"
      >
        <div className="flex-row content-between justify-between">
          <Logo className="h-8 text-white" />
          <div className="flex-row gap-4">
            <LocaleSwitch locales={locales} />
          </div>
        </div>
        <div className="w-full flex-row justify-between">
          <Column links={footer.primary} />
          <div>
            {social.map((link, index) => (
              <Arrive key={link.href} wait={0.15 + index * STAGGER}>
                <a className="flex items-center" href={link.href}>
                  {link.label}
                  <ArrowTopRight className="size-10" />
                </a>
              </Arrive>
            ))}
          </div>
        </div>
        <div className="w-full flex-row justify-between">
          <Column links={footer.secondary} />
        </div>
        {footer.cta && (
          // The query is the whole of the href, so the dialog opens on the page it is read on,
          // which is what the legacy link did (section 3.9).
          <NextLink
            className="md:self-start"
            href={`?showBooking=${footer.cta.source}`}
            scroll={false}
          >
            <button>{footer.cta.label}</button>
          </NextLink>
        )}
        <Arrive className="items-center gap-2 pr-24 md:pr-0" wait={0.4}>
          <p>{footer.legal?.location}</p>
          <p>{copyright}</p>
        </Arrive>
      </Arrive>
    </section>
  )
}
