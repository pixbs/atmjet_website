'use client'

import { m } from 'motion/react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import { dialog } from '@/lib/motion'
import { REJECT_ALL, type Consent } from '@/lib/consent'

/**
 * The cookie settings a visitor opens from the banner (issue #91, `docs/legacy-inventory.md`
 * section 3.7): what is necessary, what is marketing, what is personal, and a button for each
 * answer.
 *
 * The legacy panel was a `<section>` with a click handler on the backdrop: nothing told a
 * screen reader it was a dialog, Escape did not close it, and the focus stayed behind it on the
 * page. It is a dialog here, and the focus goes into it and comes back out.
 */
export function CookieModal({
  consent,
  onClose,
  onDecide,
}: {
  /** What the visitor has answered before, which is what the boxes open on. */
  consent: Consent
  onClose: () => void
  onDecide: (consent: Consent) => void
}) {
  const t = useTranslations('cookies')
  const panel = useRef<HTMLDivElement>(null)
  const [choice, setChoice] = useState(consent)

  useEffect(() => {
    const opener = document.activeElement
    panel.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      if (opener instanceof HTMLElement) opener.focus()
    }
  }, [onClose])

  return (
    <m.section
      animate="visible"
      aria-label={t('title')}
      aria-modal="true"
      className="fixed inset-0 z-cookie-modal bg-graphite-950/40 backdrop-blur-sm"
      data-section="cookie-modal"
      exit="exit"
      initial="hidden"
      onClick={(event) => {
        if (!panel.current?.contains(event.target as Node)) onClose()
      }}
      role="dialog"
      variants={dialog}
    >
      <div
        className="relative container mx-auto max-h-svh items-center overflow-auto rounded-2xl bg-graphite-950 p-10! pb-0!"
        ref={panel}
        tabIndex={-1}
      >
        <div className="max-w-screen-md gap-8 self-center pb-10">
          <h2>{t('title')}</h2>
          <p>{t('description')}</p>
          <hr />
          <div className="flex-row justify-between text-white">
            <p>{t('necessary')}</p>
            <p>{t('required')}</p>
          </div>
          <hr />
          <div className="flex-row justify-between text-white">
            <label className="w-full" htmlFor="marketing-consent">
              {t('marketingCookies')}
            </label>
            <Checkbox
              checked={choice.marketing}
              id="marketing-consent"
              onChange={(event) => setChoice({ ...choice, marketing: event.target.checked })}
            />
          </div>
          <hr />
          <div className="flex-row justify-between text-white">
            <label className="w-full" htmlFor="personal-consent">
              {t('personalCookies')}
            </label>
            <Checkbox
              checked={choice.personal}
              id="personal-consent"
              onChange={(event) => setChoice({ ...choice, personal: event.target.checked })}
            />
          </div>
          <hr />
        </div>
        <div className="sticky inset-x-0 bottom-0 w-full max-w-screen-md flex-row gap-2 bg-graphite-950 pt-4 pb-10">
          <button className="middle dark w-full" onClick={() => onDecide(REJECT_ALL)} type="button">
            {t('reject')}
          </button>
          <button className="middle w-full" onClick={() => onDecide(choice)} type="button">
            {t('accept')}
          </button>
        </div>
      </div>
    </m.section>
  )
}
