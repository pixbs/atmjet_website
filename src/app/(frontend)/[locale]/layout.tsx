import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import { MotionProvider } from '@/components/providers/motion-provider'
import { routing } from '@/i18n/routing'

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
export function generateStaticParams(): Array<{ locale: string }> {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // A prefix that is not a routed locale never reaches a page (ADR-0003: hidden locales stay
  // unreachable until SiteSettings enables them).
  if (!hasLocale(routing.locales, locale)) {
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
