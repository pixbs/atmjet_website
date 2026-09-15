'use client'

import { m } from 'motion/react'

import { ArrowTopRight } from '@/components/icons'
import { buttonVariants } from '@/components/ui/button'
import { LocaleSwitch } from '@/components/ui/locale-switch'
import type { Locale } from '@/i18n/locales'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/cn'
import type { HeaderNav } from '@/lib/header'
import { fade, overlay } from '@/lib/motion'
import type { NavLink } from '@/lib/nav'

/**
 * The menu the header opens (`docs/legacy-inventory.md` section 3.3, issue #88): the whole
 * viewport under a blur, the services on the left, the company on the right, the ways to reach
 * ATM JET below them, and the language links in the corner.
 *
 * It animates, so it is a client component, as the legacy one was for the same reason. It holds
 * no state of its own: every link comes from the Header global, read on the server. The overlay
 * fades over 200 ms and each link over 150 ms, which is what the legacy classes rendered
 * (`docs/adr/0006-styling-and-motion.md`); the inner variants are inherited, so the children are
 * animated by the same sequence that mounts the overlay.
 */

/** One way to reach ATM JET, as the legacy menu drew it: the name, then the arrow. */
export interface SocialLink {
  label: string
  href: string
}

function MenuLink({ link, className }: { link: NavLink; className?: string }) {
  return (
    <m.div variants={fade}>
      <Link href={link.href} className={className}>
        {link.label}
      </Link>
    </m.div>
  )
}

export function Navbar({
  nav,
  social,
  locales,
}: {
  nav: HeaderNav
  social: SocialLink[]
  /** The languages the site serves, from `SiteSettings` (issue #53). */
  locales: readonly Locale[]
}) {
  const pathname = usePathname()

  // The legacy booking link kept the visitor on the page they were reading and only added the
  // query the dialog of E6.6 opens on (`docs/legacy-inventory.md` section 3.9).
  const booking = nav.cta && {
    label: nav.cta.label,
    href: { pathname, query: { showBooking: nav.cta.source } },
  }

  return (
    <m.section
      animate="visible"
      className="fixed inset-0 bottom-0 z-40 flex-col overflow-y-auto bg-graphite-900/80 backdrop-blur-xl lg:bottom-auto"
      data-section="navbar"
      exit="hidden"
      initial="hidden"
      variants={overlay}
    >
      <nav className="container m-0! flex h-full flex-row! content-stretch pt-36 pb-10">
        <div className="w-full flex-col justify-between lg:flex-row">
          <div>
            {nav.primary.map((link) => (
              <MenuLink key={link.href} link={link} />
            ))}
            {booking && (
              <m.div variants={fade} className="hidden lg:flex">
                <Link
                  className={cn(buttonVariants({ as: 'link' }), 'mt-4 self-start')}
                  href={booking.href}
                  scroll={false}
                >
                  {booking.label}
                </Link>
              </m.div>
            )}
          </div>
          <div>
            {social.map((link) => (
              <m.div key={link.href} variants={fade}>
                <a href={link.href} className="flex items-center">
                  {link.label}
                  <ArrowTopRight className="size-10" />
                </a>
              </m.div>
            ))}
            {booking && (
              <m.div variants={fade} className="lg:hidden">
                <Link
                  className={cn(buttonVariants({ as: 'link' }), 'mt-4 self-start')}
                  href={booking.href}
                  scroll={false}
                >
                  {booking.label}
                </Link>
              </m.div>
            )}
          </div>
        </div>
        <div className="w-full flex-col justify-between">
          <div>
            {nav.secondary.map((link) => (
              <MenuLink key={link.href} link={link} className="text-right" />
            ))}
          </div>
          <div className="flex-row justify-end gap-4">
            <LocaleSwitch locales={locales} />
          </div>
        </div>
      </nav>
    </m.section>
  )
}
