import { NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import { MotionProvider } from '@/components/providers/motion-provider'
import type { Locale } from '@/i18n/locales'
import { getEnabledLocales } from '@/lib/data/site-settings'
import { siteOrigin } from '@/lib/urls'

import '../globals.css'

/**
 * What a route inherits when it says nothing of its own (issue #170). The legacy layout computed
 * exactly these two strings and then never returned them, so every page of the site shipped an
 * empty title (`docs/legacy-inventory.md` section 2.4); they are restored here, in the locale
 * the visitor asked for rather than in English only.
 *
 * `metadataBase` is what resolves a relative image or canonical into an absolute URL, and its
 * absence is what makes Next warn on every build that it is falling back to localhost.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo' })

  return {
    metadataBase: new URL(siteOrigin()),
    title: t('siteTitle'),
    description: t('siteDescription'),
  }
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
