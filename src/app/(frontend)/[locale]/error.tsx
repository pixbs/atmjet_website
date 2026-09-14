'use client'

import { useTranslations } from 'next-intl'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'

/**
 * The error boundary of the public site. The legacy site had none, so a page that threw — the
 * yachts listing did, on an empty table — showed Next's default error page
 * (`docs/legacy-inventory.md` sections 2.5 and 4.13).
 *
 * A client component, because that is what an error boundary is; the copy still comes from the
 * catalogue through the provider the locale layout mounts.
 */
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const t = useTranslations('errors.unexpected')

  useEffect(() => {
    // Until error monitoring is chosen (issue #36) the server log is where this is read.
    console.error(error)
  }, [error])

  return (
    <section className="container min-h-svh items-start justify-center gap-6 py-24">
      <h1>{t('title')}</h1>
      <p className="max-w-screen-sm">{t('description')}</p>
      <Button size="middle" onClick={reset}>
        {t('retry')}
      </Button>
    </section>
  )
}
