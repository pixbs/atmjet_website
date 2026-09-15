'use client'

import { AnimatePresence, m } from 'motion/react'
import { useState } from 'react'

import { ArrowTopRight, Close, Plane } from '@/components/icons'
import { LocaleSwitch } from '@/components/ui/locale-switch'
import type { Locale } from '@/i18n/locales'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/cn'
import { fade, overlay, spin } from '@/lib/motion'
import type { NavLink } from '@/lib/nav'

/**
 * The floating button on the home page and the panel it opens (issue #94,
 * `docs/legacy-inventory.md` section 3.5): a paper plane in the corner that turns into a cross,
 * with the ways to reach ATM JET, the booking button and the language links behind it.
 *
 * The icons spin as they swap and each link fades in, which is what the legacy classes rendered
 * (`animate-in spin-in`, `animate-in fade-in`); `duration-600` is not a Tailwind class, so both
 * ran at 150 ms and do here (section 13, entry 16).
 *
 * Everything it shows is read on the server and handed over; this file holds the one piece of
 * state (ADR-0007).
 */
export interface MenuBarProps {
  /** The ways to reach ATM JET, in the order the site settings list them. */
  social: NavLink[]
  /** The booking button, with the `?showBooking=` value the legacy link carried. */
  booking?: NavLink
  /** A page the menu points at where this language has wording for it (section 3.5). */
  page?: NavLink
  /** The languages the site serves, from `SiteSettings` (issue #53). */
  locales: readonly Locale[]
  labels: { open: string; close: string }
}

export function MenuBar({ social, booking, page, locales, labels }: MenuBarProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <section className="pointer-events-none fixed inset-x-0 bottom-0 z-30" data-section="angle-bar">
      <div className="container items-end">
        <div
          className={cn(
            'relative z-40 rounded-full p-4 backdrop-blur-2xl',
            isOpen ? 'bg-graphite-100' : 'bg-graphite-950/10',
          )}
        >
          <button
            aria-expanded={isOpen}
            aria-label={isOpen ? labels.close : labels.open}
            // The legacy had no button here at all — the icon carried the click, so it took the
            // page's own colour and a keyboard could not reach it. The button is the fix; its
            // colour is set back to what the icon inherited.
            className="pointer-events-auto bg-transparent p-0 text-graphite-400"
            onClick={() => setIsOpen((open) => !open)}
            type="button"
          >
            <m.span
              animate="visible"
              className="flex"
              initial="hidden"
              key={isOpen ? 'close' : 'open'}
              variants={spin}
            >
              {isOpen ? (
                <Close className="size-9 text-graphite-950" />
              ) : (
                <Plane className="size-9" />
              )}
            </m.span>
          </button>
        </div>
        <AnimatePresence>
          {isOpen && (
            <m.div
              animate="visible"
              className="pointer-events-auto absolute right-10 bottom-0 -mr-1.5 -mb-1.5 flex-row rounded-2xl bg-white px-7 py-5 text-graphite-950 lg:right-16"
              exit="hidden"
              initial="hidden"
              variants={overlay}
            >
              <div>
                {social.map((link) => (
                  <m.div key={link.href} variants={fade}>
                    <a className="flex items-center" href={link.href}>
                      {link.label}
                      <ArrowTopRight className="size-10 text-graphite-500" />
                    </a>
                  </m.div>
                ))}
                {page && (
                  <m.div variants={fade}>
                    <Link className="pt-10" href={page.href}>
                      {page.label}
                    </Link>
                  </m.div>
                )}
                {booking && (
                  <m.div variants={fade}>
                    {/* The query is the whole of the href, so the dialog opens on the page it is
                        read on, which is what the legacy link did (section 3.9). */}
                    <a className="mt-4 mr-16 self-start" href={booking.href}>
                      <button className="bg-graphite-950 text-white" type="button">
                        {booking.label}
                      </button>
                    </a>
                  </m.div>
                )}
              </div>
              <div className="h-full items-start justify-end">
                <LocaleSwitch locales={locales} />
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
