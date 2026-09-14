import type { BreadcrumbList, Organization, Thing, WebSite, WithContext } from 'schema-dts'

import type { Locale } from '@/i18n/locales'

import { instagramHref, telHref, telegramHref } from './links'
import { localeUrl } from './urls'

/**
 * What the site tells a search engine about itself in machine-readable form (issue #173). The
 * legacy site emitted none, so nothing connected its pages to the company behind them.
 *
 * The values are the ones an editor keeps in `SiteSettings` (issue #61), so the structured data
 * and the visible chrome can never disagree about a phone number the way the legacy site's six
 * copies did (`docs/legacy-inventory.md` section 9.5).
 */

/**
 * One node of the graph. `schema-dts` types every value as "the thing or a reference to it", so
 * the bare-string arm is dropped here: these builders always return the thing itself, and a
 * caller reading a property off the union otherwise cannot.
 */
type Node<T extends Thing> = WithContext<Extract<T, { '@type': string }>>

/** Stable identities, so `WebSite` and a breadcrumb can point at the same company. */
const organisationId = (origin: string) => `${origin}/#organisation`
const webSiteId = (origin: string) => `${origin}/#website`

export interface SiteContact {
  phone: string
  email: string
  telegram: string
  instagram: string
}

export function organisation(
  origin: string,
  name: string,
  contact: SiteContact,
): Node<Organization> {
  // `sameAs` is for profiles a search engine can crawl; the WhatsApp link opens a chat with no
  // page behind it, so it stays a contact method rather than an identity.
  const profiles = [telegramHref(contact.telegram), instagramHref(contact.instagram)].filter(
    (url) => url !== '',
  )

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': organisationId(origin),
    name,
    url: `${origin}/`,
    // The dialled form, which is what `tel:` carries and what a search engine wants.
    telephone: telHref(contact.phone).replace('tel:', ''),
    email: contact.email,
    ...(profiles.length > 0 ? { sameAs: profiles } : {}),
  }
}

export function webSite(
  origin: string,
  locale: Locale,
  name: string,
  description: string,
): Node<WebSite> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': webSiteId(origin),
    url: localeUrl(origin, locale, ''),
    name,
    description,
    inLanguage: locale,
    publisher: { '@id': organisationId(origin) },
  }
}

/**
 * `Home > This page`, the trail a search result shows instead of a bare URL. Only a subpage has
 * one: the home page is the trail's first item, not a trail of its own.
 */
export function breadcrumbs(
  origin: string,
  locale: Locale,
  home: string,
  page: { slug: string; title: string },
): Node<BreadcrumbList> | null {
  if (page.slug === '') return null

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: home, item: localeUrl(origin, locale, '') },
      {
        '@type': 'ListItem',
        position: 2,
        name: page.title,
        item: localeUrl(origin, locale, page.slug),
      },
    ],
  }
}
