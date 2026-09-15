'use client'

import { GoogleTagManager } from '@next/third-parties/google'
import { AnimatePresence, m } from 'motion/react'
import { useTranslations } from 'next-intl'
import { useState, useSyncExternalStore } from 'react'

import { ACCEPT_ALL, consentCookies, readConsent, REJECT_ALL, type Consent } from '@/lib/consent'
import { banner } from '@/lib/motion'

import { CookieModal } from './cookie-modal'

/**
 * The answer, read from the browser's own cookies rather than held in state: the banner has to
 * know it before the first paint after hydration, and setting state from an effect to find out
 * would draw the banner at everyone, answered or not.
 */
const listeners = new Set<() => void>()

let snapshot: { cookies: string; consent: Consent | null } | undefined

function subscribe(listener: () => void) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

/** Cached against the cookie string, because React compares the snapshot by identity. */
function currentConsent(): Consent | null {
  if (snapshot?.cookies !== document.cookie) {
    snapshot = { cookies: document.cookie, consent: readConsent(document.cookie) }
  }

  return snapshot.consent
}

/** Nothing is known on the server, and nothing is drawn there either. */
const noConsent = () => null

/** False while the server's HTML is being matched, true from the first client render after it. */
const hydrated = () => true
const notHydrated = () => false
const never = () => () => {}

/**
 * The cookie question, and what the answer to it decides (issue #91,
 * `docs/legacy-inventory.md` section 3.7).
 *
 * The legacy banner asked and the answer changed nothing: Google Tag Manager loaded from the
 * layout on every visit, whichever button was clicked (section 13, entry 71). Here the tag is
 * inside the same island as the question, so a visitor who says no is not measured — which is
 * the whole point of asking.
 *
 * The cookie is read in the browser rather than on the server, as the legacy read it: every
 * page of this site is prerendered, and a layout that reads a cookie is a layout that cannot be
 * (ADR-0007). The banner therefore arrives with hydration, which is what the legacy did too.
 */
export function CookieConsent({ gtmId }: { gtmId?: string }) {
  const t = useTranslations('cookies')
  const consent = useSyncExternalStore(subscribe, currentConsent, noConsent)
  const isHydrated = useSyncExternalStore(never, hydrated, notHydrated)
  const [isOpen, setIsOpen] = useState(false)

  const decide = (choice: Consent) => {
    for (const cookie of consentCookies(choice)) document.cookie = cookie

    setIsOpen(false)
    for (const listener of listeners) listener()
  }

  return (
    <>
      <AnimatePresence>
        {isHydrated && consent === null && (
          <m.section
            animate="visible"
            className="fixed inset-x-0 bottom-0 z-cookie-banner"
            data-section="cookie-banner"
            exit="exit"
            initial="hidden"
            variants={banner}
          >
            <div className="container flex-row! flex-wrap gap-6 rounded-2xl bg-graphite-950 p-6">
              {/* The legacy sentence ended in a link to `/privacy`, which answered 404 there
                  (section 13, entry 71); issue #57 decided that nothing points at it until the
                  policy text exists, so the clause that introduced it goes with the link. */}
              <p>{t('message')}</p>
              <div className="flex-row flex-wrap items-center gap-2">
                <button
                  className="middle dark w-full md:w-auto"
                  onClick={() => setIsOpen(true)}
                  type="button"
                >
                  {t('customize')}
                </button>
                <button
                  className="middle dark w-full md:w-auto"
                  onClick={() => decide(REJECT_ALL)}
                  type="button"
                >
                  {t('rejectAll')}
                </button>
                <button
                  className="middle w-full md:w-auto"
                  onClick={() => decide(ACCEPT_ALL)}
                  type="button"
                >
                  {t('acceptAll')}
                </button>
              </div>
            </div>
          </m.section>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isOpen && (
          <CookieModal
            consent={consent ?? REJECT_ALL}
            onClose={() => setIsOpen(false)}
            onDecide={decide}
          />
        )}
      </AnimatePresence>
      {/* Nothing is loaded until the visitor has said yes, and nothing at all where the
          deployment has no tag to load (`NEXT_PUBLIC_GTM_ID`). */}
      {consent?.marketing === true && gtmId !== undefined && gtmId !== '' && (
        <GoogleTagManager gtmId={gtmId} />
      )}
    </>
  )
}
