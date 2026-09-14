import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/locales'
import { getHeaderNav } from '@/lib/data/header'
import { getSocialLinks } from '@/lib/data/site-settings'
import { SOCIAL_NETWORKS } from '@/lib/links'

import { HeaderBar } from './header-bar'
import { Navbar, type SocialLink } from './navbar'

/**
 * The site chrome (issue #88): the bar on every page and the menu behind it.
 *
 * Everything it shows is read here, on the server — the navigation an editor keeps in the
 * Header global and the accounts they keep in the site settings — and handed to the two client
 * pieces that animate it (ADR-0007). The legacy header hard-coded all of it in the component
 * that rendered it (`docs/legacy-inventory.md` sections 3.2 and 3.3).
 */
export async function Header({
  locale,
  locales,
}: {
  locale: Locale
  /** The languages the site serves, from `SiteSettings` (issue #53). */
  locales: readonly Locale[]
}) {
  const [nav, hrefs, t] = await Promise.all([
    getHeaderNav(locale),
    getSocialLinks(),
    getTranslations({ locale, namespace: 'social' }),
  ])

  const social: SocialLink[] = SOCIAL_NETWORKS.flatMap((network) =>
    hrefs[network] === '' ? [] : [{ label: t(network), href: hrefs[network] }],
  )

  return <HeaderBar menu={<Navbar nav={nav} social={social} locales={locales} />} />
}
