import { NextIntlClientProvider } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import { MotionProvider } from '@/components/providers/motion-provider'
import type { Locale } from '@/i18n/locales'
import { getEnabledLocales } from '@/lib/data/site-settings'

import '../globals.css'

export const metadata: Metadata = {
  title: 'ATM JET',
  description: 'Private jet charter, yachts and cargo. Rebuilt on Payload 3 and Next.js 16.',
}

/**
 * Root layout of the public site. It lives under `[locale]` because `lang` and the message
 * catalogue both depend on the locale, and because every frontend route carries the prefix
 * (ADR-0003). The Payload admin has its own root layout under `(payload)`.
 */
export async function generateStaticParams(): Promise<Array<{ locale: string }>> {
  return (await getEnabledLocales()).map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // A prefix that is not an enabled locale never reaches a page: the proxy stops routing it and
  // this is the second door, for a request that arrives at the route directly (issue #53).
  if (!(await getEnabledLocales()).includes(locale as Locale)) {
    notFound()
  }

  // Opts the segment into static rendering; without it every page below is dynamic.
  setRequestLocale(locale)

  return (
    <html lang={locale}>
      <body className="min-h-dvh bg-graphite-900 font-sans text-white antialiased">
        <NextIntlClientProvider>
          <MotionProvider>
            <main>{children}</main>
          </MotionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
