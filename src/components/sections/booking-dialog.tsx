'use client'

import { m } from 'motion/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'

import { BookingForm } from '@/components/form/booking-form'
import { ArrowTopRight, Close } from '@/components/icons'
import { FadeIn } from '@/components/motion/fade-in'
import type { PhoneInputProps } from '@/components/ui/phone-input'
import type { Locale } from '@/i18n/locales'
import { dialog } from '@/lib/motion'

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
  /** The chips a visitor may tick, in the language being read. */
  tags: readonly string[]
  /** The three accounts, from the site settings the chrome already reads (issue #61). */
  social: readonly { label: string; href: string }[]
  /** `null` where the settings could not be read; the line is then left out rather than empty. */
  phone: { label: string; href: string } | null
  labels: { title: string; close: string }
}

export function BookingDialog({
  locale,
  defaultCountry,
  tags,
  social,
  phone,
  labels,
}: BookingDialogProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const panel = useRef<HTMLDivElement>(null)
  const isOpen = searchParams.has('showBooking')

  useEffect(() => {
    if (!isOpen) return

    // What the legacy effect did, so the page behind does not scroll under the dialog.
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    const opener = document.activeElement
    panel.current?.focus()

    const close = () => router.push(pathname, { scroll: false })
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = overflow
      if (opener instanceof HTMLElement) opener.focus()
    }
  }, [isOpen, pathname, router])

  if (!isOpen) return null

  // The legacy pushed the pathname alone, so every parameter went with it — `direction` and the
  // campaign included (section 13, entry 72, `keep`).
  const close = () => router.push(pathname, { scroll: false })

  return (
    <m.section
      animate="visible"
      aria-label={labels.title}
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-graphite-950/40 backdrop-blur-sm"
      data-section="booking-dialog"
      exit="exit"
      initial="hidden"
      onClick={(event) => {
        if (!panel.current?.contains(event.target as Node)) close()
      }}
      role="dialog"
      variants={dialog}
    >
      {/* `.container` is an unlayered parity rule, so its padding needs the important marker,
          exactly as the legacy `!p-14` did (ADR-0006). */}
      <div
        // The focus lands here so a screen reader starts inside the dialog, not so a keyboard
        // stops here: the ring a browser draws on a programmatic focus is what the legacy
        // panel, which nothing ever focused, did not have.
        className="relative container mx-auto rounded-2xl bg-graphite-950 stroke-graphite-100 stroke-1 p-14! focus:outline-hidden"
        ref={panel}
        tabIndex={-1}
      >
        <div className="max-w-screen-md gap-8 self-center">
          {/* The legacy hung the click on the icon itself, which no keyboard could reach. It is
              a button now, stripped of the pill the parity layer gives one and wearing the
              colour the icon inherited where it stood, so nothing about it is drawn differently. */}
          <button
            aria-label={labels.close}
            className="absolute top-12 right-12 size-10 bg-transparent p-0 text-graphite-400 hover:opacity-80"
            onClick={close}
            type="button"
          >
            <Close className="size-10" />
          </button>
          <BookingForm
            defaultCountry={defaultCountry}
            formType="booking-dialog"
            locale={locale}
            tags={tags}
          />
          <div className="flex-row flex-wrap items-center justify-center gap-4">
            {social.map((account) => (
              <FadeIn key={account.href}>
                {/* Addresses outside this site, so plain anchors rather than `Link` (#262). */}
                <a className="flex items-center text-base" href={account.href}>
                  {account.label}
                  <ArrowTopRight className="size-10" />
                </a>
              </FadeIn>
            ))}
          </div>
          {phone && (
            // The legacy dialled a number other than the one it printed; both are the one an
            // editor writes now (section 13, entry 73, settled when the settings shipped).
            <a className="-mt-6! text-center text-base text-graphite-300" href={phone.href}>
              {phone.label}
            </a>
          )}
        </div>
      </div>
    </m.section>
  )
}
