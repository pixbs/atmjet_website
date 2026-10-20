import * as Flags from 'country-flag-icons/react/3x2'
import type { CountryCode } from 'libphonenumber-js'

import type { Locale } from '@/i18n/locales'
import { countryName } from '@/lib/country-name'

/**
 * The flag a phone field opens on, for a server component to hand it: drawn here, the flags stay
 * out of the page's scripts until the field is used (issue #428).
 */
export function CountryFlag({ iso, locale }: { iso: CountryCode; locale: Locale }) {
  const Flag = Flags[iso]

  return Flag ? <Flag className="size-4" title={countryName(iso, locale)} /> : null
}
