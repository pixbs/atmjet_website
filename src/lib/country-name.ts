import type { CountryCode } from 'libphonenumber-js'

import type { Locale } from '@/i18n/locales'

/**
 * Country names, apart from `countries.ts` so the phone field can name its country without
 * loading libphonenumber with the page (issue #428). The platform knows the names already.
 */
export const displayNames = (locale: Locale) =>
  new Intl.DisplayNames([locale, 'en'], { type: 'region', fallback: 'code' })

/** A country's name in the language being read: `United Arab Emirates`, `ОАЭ`, `ОАЕ`. */
export function countryName(iso: CountryCode, locale: Locale): string {
  return displayNames(locale).of(iso) ?? iso
}
