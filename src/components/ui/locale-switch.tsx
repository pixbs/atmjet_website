'use client'

import { cva } from 'class-variance-authority'
import { useLocale, useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import React, { Suspense } from 'react'

import { LOCALE_DEFINITIONS, type Locale } from '@/i18n/locales'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/cn'
import { localeSwitchHref } from '@/lib/urls'

/**
 * The language links of the chrome (issue #90), reproducing `elements/localeSwitcher.tsx`
 * (`docs/legacy-inventory.md` section 3.6): the languages side by side, the one being read
 * dimmed, and the visitor kept on the page they were looking at.
 *
 * Two legacy quirks are fixed while porting (section 13, entry 74): the switched URL no longer
 * ends in a bare `?` when there is nothing to carry, and the inactive link no longer carries the
 * literal class `false`.
 */
// Not exported yet: nothing outside this file wears these classes until the chrome of E6.1
// gives the switcher a home, and an export without a caller is one the conventions refuse.
const localeLinkVariants = cva('text-base', {
  variants: { isCurrent: { true: 'opacity-50', false: '' } },
  defaultVariants: { isCurrent: false },
})

const shortLabelOf = (locale: Locale): string =>
  LOCALE_DEFINITIONS.find((definition) => definition.code === locale)?.short ?? locale

interface LocaleLinksProps extends React.HTMLAttributes<HTMLElement> {
  /** The languages the site serves, from `SiteSettings` (issue #53). */
  locales: readonly Locale[]
  /** The URL to land on, in each language. */
  href: string
}

function LocaleLinks({ locales, href, className, ...props }: LocaleLinksProps) {
  const current = useLocale()
  const t = useTranslations('common')

  return (
    <nav
      aria-label={t('language')}
      // `flex` as well as the direction: the legacy switcher had no element of its own and
      // inherited the flex box of the div that held it (`docs/legacy-inventory.md` section 3.6),
      // and a bare `flex-row` on this nav left the two languages touching.
      className={cn('flex flex-row items-center gap-4', className)}
      {...props}
    >
      {locales.map((locale) => (
        <Link
          key={locale}
          href={href}
          locale={locale}
          // The legacy switcher held the scroll position across the switch.
          scroll={false}
          aria-current={locale === current ? 'true' : undefined}
          className={localeLinkVariants({ isCurrent: locale === current })}
        >
          {shortLabelOf(locale)}
        </Link>
      ))}
    </nav>
  )
}

function WithQuery({ pathname, ...props }: Omit<LocaleLinksProps, 'href'> & { pathname: string }) {
  const search = useSearchParams().toString()

  return <LocaleLinks href={localeSwitchHref(pathname, search)} {...props} />
}

/**
 * Reading the query makes the tree up to the nearest Suspense boundary render on the client
 * (`node_modules/next/dist/docs/.../use-search-params.md`), which would take a navigation
 * element out of the server's HTML. The boundary lives here so no caller can forget it, and its
 * fallback is the same links without the query: the server sends working links, and the query
 * joins them on hydration.
 */
export function LocaleSwitch({ locales, className, ...props }: Omit<LocaleLinksProps, 'href'>) {
  const pathname = usePathname()

  return (
    <Suspense
      fallback={<LocaleLinks locales={locales} href={pathname} className={className} {...props} />}
    >
      <WithQuery locales={locales} pathname={pathname} className={className} {...props} />
    </Suspense>
  )
}
