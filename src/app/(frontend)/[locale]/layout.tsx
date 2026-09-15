import { NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import { MotionProvider } from '@/components/providers/motion-provider'
import { Footer } from '@/components/sections/footer'
import { Header } from '@/components/sections/header'
import { JsonLd } from '@/components/ui/json-ld'
import type { Locale } from '@/i18n/locales'
import { getEnabledLocales, getSiteContact } from '@/lib/data/site-settings'
import { organisation, webSite } from '@/lib/structured-data'
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
  const locales = await getEnabledLocales()
  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  // Opts the segment into static rendering; without it every page below is dynamic.
  setRequestLocale(locale)

  // Who the site belongs to and how to reach them, on every page (issue #173).
  const origin = siteOrigin()
  const [contact, t] = await Promise.all([
    getSiteContact(),
    getTranslations({ locale, namespace: 'seo' }),
  ])

  return (
    <html lang={locale}>
      {/* The page colour is the parity layer's, on `:root` as the legacy stylesheet had it.
          Painting it here as well would put the body's background over anything a section
          sends behind itself with a negative z-index, which is how the legacy drew the
          photograph under the options tiles (issue #119).

          The text colour is `:root`'s for the same reason: it is what the legacy left every
          element that carried no colour of its own to inherit, and a colour here would beat it
          for the whole page (issue #300). What the legacy drew white says so where it is
          drawn. */}
      <body className="min-h-dvh font-sans antialiased">
        <NextIntlClientProvider>
          <MotionProvider>
            <Header locale={locale as Locale} locales={locales} />
            <main>{children}</main>
            <Footer locale={locale as Locale} locales={locales} />
          </MotionProvider>
        </NextIntlClientProvider>
        {contact && <JsonLd data={organisation(origin, t('siteName'), contact)} />}
        <JsonLd data={webSite(origin, locale as Locale, t('siteName'), t('siteDescription'))} />
      </body>
    </html>
  )
}
