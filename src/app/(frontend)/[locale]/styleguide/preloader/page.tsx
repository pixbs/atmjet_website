import { setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import React from 'react'

import { Preloader } from '@/components/ui/preloader'

/**
 * Fixture page for the preloader (issue #92). It covers the whole viewport, so it cannot share
 * the styleguide with anything else; this is the page the visual tier screenshots.
 *
 * The static variant is the one pinned here: it holds its first frame, so it renders the same
 * with reduced motion, which is how the visual tier runs. The animated variant is the same
 * component with the flag off, and it lands on the home page with E8.1.
 *
 * The heading behind the curtain is what proves the page is server-rendered underneath it,
 * which is the point of a preloader that is not a loading screen (ADR-0007).
 */
export const metadata: Metadata = {
  title: 'Preloader',
  robots: { index: false, follow: false },
}

export default async function PreloaderPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <div className="container gap-8 py-16">
      <h1>Behind the preloader</h1>
      <p>The page the visitor asked for is already here while the curtain is up.</p>
      <Preloader isStatic />
    </div>
  )
}
