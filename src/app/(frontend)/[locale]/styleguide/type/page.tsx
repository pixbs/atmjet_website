import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import React from 'react'

/**
 * The type specimen (issue #51): both faces, at the sizes the site sets them, in the language of
 * the page it is read in.
 *
 * It exists for the visual tier and for a human checking a font change. The Cyrillic is the
 * point of it as much as the Latin: the legacy site loaded the latin subset of Inter alone, so
 * every Russian page fell back to whatever the system offered, and the owner's decision of
 * 2026-09-13 to add `cyrillic` is only visible on a page that has some.
 */
export const metadata: Metadata = {
  title: 'Type specimen',
  robots: { index: false, follow: false },
}

/** Both alphabets on every page, whichever language it is read in, so one clip shows both. */
const ALPHABETS = [
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789',
  'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ абвгдеёжзийклмнопрстуфхцчшщъыьэюя',
]

export default async function TypeSpecimenPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'seo' })

  return (
    <div className="container gap-12 py-16" data-section="type-specimen">
      <section className="gap-4" data-specimen="display">
        <h1>Display</h1>
        {/* What `font-serif` resolves to: the licensed face the headings are set in. */}
        {ALPHABETS.map((alphabet) => (
          <p className="font-serif text-3xl" key={alphabet}>
            {alphabet}
          </p>
        ))}
        <h2 className="font-serif">{t('siteName')}</h2>
      </section>
      <section className="gap-4" data-specimen="body">
        <h1>Body</h1>
        {ALPHABETS.map((alphabet) => (
          <p className="text-lg" key={alphabet}>
            {alphabet}
          </p>
        ))}
        {/* A paragraph of the language being read, which is where a missing subset shows. */}
        <p>{t('siteDescription')}</p>
      </section>
    </div>
  )
}
