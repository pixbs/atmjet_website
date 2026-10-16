'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import type { PhoneInputProps } from '@/components/ui/phone-input'
import type { Locale } from '@/i18n/locales'

/**
 * The dialog every booking button on the site opens (issue #93, `docs/legacy-inventory.md`
 * section 3.9): the booking form, the three ways to reach the company, and the telephone number
 * under them.
 *
 * The query is the whole of the contract: it is open while `?showBooking=` is there, whatever
 * the value, and that value travels into the lead as the button it came from (section 7.5).
 * Closing drops every parameter with it, which section 13 entry 72 marks `keep`.
 *
 * What the legacy did not have is the part a screen reader needs: it was a `<section>` with a
 * click handler, so nothing said it was a dialog, Escape did nothing and the focus stayed on the
 * page behind it. That is fixed here, as it was for the cookie modal (issue #91), and none of it
 * changes a pixel.
 */
export interface BookingDialogProps {
  locale: Locale
  /** Where the phone field opens, resolved from the request on the server (issue #160). */
  defaultCountry: PhoneInputProps['defaultCountry']
  flag: PhoneInputProps['flag']
  /** The chips a visitor may tick, in the language being read. */
  tags: readonly string[]
  /** The three accounts, from the site settings the chrome already reads (issue #61). */
  social: readonly { label: string; href: string }[]
  /** `null` where the settings could not be read; the line is then left out rather than empty. */
  phone: { label: string; href: string } | null
  labels: { title: string; close: string }
}

type Panel = typeof import('./booking-dialog-panel').BookingDialogPanel

export function BookingDialog(props: BookingDialogProps) {
  const searchParams = useSearchParams()
  const isOpen = searchParams.has('showBooking')
  const query = searchParams.toString()
  const [Panel, setPanel] = useState<Panel | null>(null)

  // Closed on almost every visit, so the panel loads once the query opens it, after hydration
  // (ADR-0007); one that cannot be fetched leaves the page as it was, and the next press of any
  // booking button, or the next change of the query, asks for it again without a navigation.
  useEffect(() => {
    if (!isOpen || Panel !== null) return

    let isCurrent = true
    const load = () =>
      import('./booking-dialog-panel').then(
        (panel) => isCurrent && setPanel(() => panel.BookingDialogPanel),
        () => undefined,
      )
    const retry = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest('a[href*="showBooking="]')) {
        void load()
      }
    }

    void load()
    document.addEventListener('click', retry)
    return () => {
      isCurrent = false
      document.removeEventListener('click', retry)
    }
  }, [isOpen, Panel, query])

  return isOpen && Panel !== null ? <Panel {...props} /> : null
}
