import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import React from 'react'

import { PAGE_LOCALES } from '@/collections/Pages'
import { routing } from '@/i18n/routing'
import { getPayloadClient } from '@/lib/data'

/**
 * Renders a page document at `/<locale>/<slug>` (issue #60), with the locale root serving the
 * page whose slug is empty.
 *
 * An optional catch-all, so a purpose-built route added later for a database-driven listing
 * (the aircraft and yachts pages of E8) takes precedence over this one automatically. The
 * sections themselves arrive in E7; until then a page renders its title, which is what the
 * acceptance test checks reaches the browser in the server response.
 */
interface PageParams {
  locale: string
  slug?: string[]
}

const slugFrom = (segments: string[] | undefined): string => (segments ?? []).join('/')

async function findPage(locale: string, slug: string) {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    locale: locale as 'en',
    limit: 1,
    depth: 0,
    // Drafts stay invisible here: this is a public read, so `publishedOnly` applies.
    overrideAccess: false,
  })

  return result.docs[0]
}

export async function generateStaticParams(): Promise<PageParams[]> {
  const payload = await getPayloadClient()
  const params: PageParams[] = []

  for (const locale of PAGE_LOCALES) {
    const pages = await payload.find({
      collection: 'pages',
      locale,
      limit: 0,
      depth: 0,
      select: { slug: true },
      overrideAccess: false,
    })

    for (const page of pages.docs) {
      const slug = page.slug ?? ''
      params.push({ locale, slug: slug === '' ? [] : slug.split('/') })
    }
  }

  return params
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const page = await findPage(locale, slugFrom(slug))

  if (!page) return {}

  const meta = (page as { meta?: { title?: string | null; description?: string | null } }).meta

  return {
    title: meta?.title || page.title,
    description: meta?.description ?? undefined,
  }
}

export default async function CatchAllPage({ params }: { params: Promise<PageParams> }) {
  const { locale, slug } = await params

  if (!routing.locales.includes(locale as 'en')) notFound()
  setRequestLocale(locale)

  const page = await findPage(locale, slugFrom(slug))

  if (!page) notFound()

  return (
    <article className="container gap-8 py-16">
      <h1>{page.title}</h1>
      {/* Sections render here from `page.layout` once the blocks of E7 exist. */}
    </article>
  )
}
