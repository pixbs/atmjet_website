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
  const isOpen = useSearchParams().has('showBooking')
  const [Panel, setPanel] = useState<Panel | null>(null)

  // Closed on almost every visit, so the form, zod and the phone field load only once it opens.
  // A panel that cannot be fetched leaves the page as it was, and the next opening asks again.
  useEffect(() => {
    if (!isOpen || Panel !== null) return

    let isCurrent = true
    import('./booking-dialog-panel').then(
      (panel) => isCurrent && setPanel(() => panel.BookingDialogPanel),
      () => undefined,
    )
    return () => {
      isCurrent = false
    }
  }, [isOpen, Panel])

  return isOpen && Panel !== null ? <Panel {...props} /> : null
}
