import { cache } from 'react'

import { ALL_LOCALES, DEFAULT_LOCALE, DEFAULT_LOCALES, type Locale } from '@/i18n/locales'
import { instagramHref, telegramHref, whatsAppHref, type SocialNetwork } from '@/lib/links'
import type { SiteContact } from '@/lib/structured-data'
import type { SiteSetting } from '@/payload-types'

import { getPayloadClient } from './payload'

/**
 * The one document that says how the site is reached and which languages it serves (issue #61).
 *
 * Read through `cache()` so a page, its layout and every block below share one query per render
 * pass. The tagged cache the rest of the site will use lands with Cache Components (issue #178);
 * until then the prerendered pages are the cache and `revalidateTag('site-settings')` from the
 * global's `afterChange` hook is what drops them.
 */
const getSiteSettings = cache(async (): Promise<SiteSetting> => {
  const payload = await getPayloadClient()

  return payload.findGlobal({ slug: 'site-settings', depth: 0 })
})

/**
 * The locales the public site serves (issue #53). Editors add a language in the admin and it
 * appears in the URLs, the prerendered pages and the switcher without a deploy.
 *
 * A build or a request that cannot reach the database falls back to the locales the site served
 * before rather than taking the site down; the default locale is always in the list, because a
 * site that serves no language has no home page.
 */
export async function getEnabledLocales(
  // Injected so the unreachable-database path can be tested without breaking the database.
  read: () => Promise<Pick<SiteSetting, 'enabledLocales'>> = getSiteSettings,
): Promise<Locale[]> {
  try {
    const { enabledLocales } = await read()
    const enabled = ALL_LOCALES.filter((locale) => enabledLocales?.includes(locale))

    return enabled.includes(DEFAULT_LOCALE) ? enabled : [DEFAULT_LOCALE, ...enabled]
  } catch (error) {
    console.warn(
      '[site-settings] the database was unreachable, so the site serves the default locales.',
      error,
    )
    return [...DEFAULT_LOCALES]
  }
}

/**
 * The contact details the structured data names (issue #173), from the same document the visible
 * chrome reads, so the two can never disagree about a phone number.
 *
 * `null` rather than a guess when the database cannot be reached: a search engine is better told
 * nothing about the company than told something invented.
 */
export async function getSiteContact(
  // Injected so the unreachable-database path can be tested without breaking the database.
  read: () => Promise<
    Pick<SiteSetting, 'phone' | 'email' | 'telegram' | 'instagram'>
  > = getSiteSettings,
): Promise<SiteContact | null> {
  try {
    const { phone, email, telegram, instagram } = await read()

    return { phone, email, telegram, instagram }
  } catch (error) {
    console.warn(
      '[site-settings] the database was unreachable, so no organisation is described.',
      error,
    )
    return null
  }
}

/**
 * Where the chrome links when a visitor wants to talk to someone (issue #88), built from the
 * handles an editor keeps rather than from a scheme they typed (src/lib/links.ts).
 *
 * A network whose handle is empty returns an empty string, and the caller leaves that link out:
 * the legacy menu always rendered all three, including the Telegram link no browser could open.
 */
export async function getSocialLinks(
  // Injected so the unreachable-database path can be tested without breaking the database.
  read: () => Promise<Pick<SiteSetting, 'telegram' | 'whatsapp' | 'instagram'>> = getSiteSettings,
): Promise<Record<SocialNetwork, string>> {
  try {
    const { telegram, whatsapp, instagram } = await read()

    return {
      telegram: telegramHref(telegram),
      whatsapp: whatsAppHref(whatsapp),
      instagram: instagramHref(instagram),
    }
  } catch (error) {
    console.warn(
      '[site-settings] the database was unreachable, so the chrome links nowhere.',
      error,
    )
    return { telegram: '', whatsapp: '', instagram: '' }
  }
}
