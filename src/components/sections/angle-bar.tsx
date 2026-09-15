import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/locales'
import { getHeaderNav } from '@/lib/data/header'
import { getSocialLinks } from '@/lib/data/site-settings'
import { SOCIAL_NETWORKS } from '@/lib/links'

import { MenuBar } from './menu-bar'

/**
 * The floating button the home page carries and nothing else does (issue #94,
 * `docs/legacy-inventory.md` section 3.5).
 *
 * What it shows is read here, on the server: the accounts from the site settings, the booking
 * wording from the Header global, and the one page link from the message catalogue. The legacy
 * drew that link for Russian readers only by comparing the locale in the component, which is
 * the habit ADR-0003 exists to end; here a language with no wording for it does not draw it,
 * and what the wording is belongs to the catalogue.
 */
export async function AngleBar({
  locale,
  locales,
}: {
  locale: Locale
  /** The languages the site serves, from `SiteSettings` (issue #53). */
  locales: readonly Locale[]
}) {
  const [nav, hrefs, t, common, social] = await Promise.all([
    getHeaderNav(locale),
    getSocialLinks(),
    getTranslations({ locale, namespace: 'angleBar' }),
    getTranslations({ locale, namespace: 'common' }),
    getTranslations({ locale, namespace: 'social' }),
  ])

  const accounts = SOCIAL_NETWORKS.flatMap((network) =>
    hrefs[network] === '' ? [] : [{ label: social(network), href: hrefs[network] }],
  )
  const citizens = t('citizens')

  return (
    <MenuBar
      // `Angle_bar` is the value the legacy link carried, and what a lead from this button is
      // traced back through (section 3.9); the wording is the Header global's.
      booking={nav.cta ? { label: nav.cta.label, href: '?showBooking=Angle_bar' } : undefined}
      labels={{ close: common('closeMenu'), open: common('openMenu') }}
      locales={locales}
      page={citizens === '' ? undefined : { label: citizens, href: '/citizens' }}
      social={accounts}
    />
  )
}
