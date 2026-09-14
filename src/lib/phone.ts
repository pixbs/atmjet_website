import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
  type CountryCode,
} from 'libphonenumber-js'

/**
 * What the phone field does to what is typed into it (issue #108,
 * `docs/legacy-inventory.md` section 7.2). The rules are the legacy field's; what changed is
 * where they live, so each can be read and tested on its own.
 */

/** Every dial code, longest first, so `+1268` is recognised before `+1`. */
const DIAL_CODES: { iso: CountryCode; digits: string }[] = getCountries()
  .map((iso) => ({ iso, digits: getCountryCallingCode(iso) }))
  .sort((one, other) => other.digits.length - one.digits.length)

/** A number always starts with `+`, as the legacy field forced on every keystroke. */
function withLeadingPlus(value: string): string {
  const digits = value.replace(/[^\d]/g, '')

  return digits === '' ? '+' : `+${digits}`
}

/** `+971 50 458 9926`: grouped as the country groups them, while it is being typed. */
export function formatPhone(value: string): string {
  return new AsYouType().input(withLeadingPlus(value))
}

/**
 * Whether the number is one a country would answer: the legacy schema asked the same library
 * (`z.string().refine(...)`, section 7.2), which is what the field is drawn in red for.
 */
export function isValidPhone(value: string): boolean {
  return isValidPhoneNumber(withLeadingPlus(value))
}

/**
 * The country a number belongs to, by its dial code.
 *
 * The legacy read at most the first three digits (`/^\+(\d{1,3})/`), so a country whose code is
 * longer — Åland Islands `+35818`, the one the field opened on — could never be matched, and a
 * shared code like `+1` matched the United States before `+1268` was finished (section 13). The
 * longest code that fits wins here.
 */
export function countryForNumber(value: string): CountryCode | undefined {
  const digits = value.replace(/[^\d]/g, '')
  if (digits === '') return undefined

  return DIAL_CODES.find((code) => digits.startsWith(code.digits))?.iso
}

/**
 * The value after a country is chosen: the dial code and a space, keeping whatever was already
 * typed when it already starts with that code.
 */
export function numberForCountry(value: string, dialCode: string): string {
  const current = withLeadingPlus(value)

  return current.startsWith(dialCode) ? formatPhone(current) : `${dialCode} `
}

/** Accents, case and spacing are not what someone searching for a country is thinking about. */
function plain(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '').toLowerCase()
}

/** Whether a country answers to what has been typed in the search box: its name or its code. */
export function matchesSearch(country: { name: string; dialCode: string }, term: string): boolean {
  const wanted = plain(term)
  if (wanted === '') return true

  const digits = wanted.replace(/[^\d]/g, '')

  return (
    plain(country.name).includes(wanted) ||
    (digits !== '' && country.dialCode.replace('+', '').startsWith(digits))
  )
}

/**
 * Whether a keystroke would eat the `+` the field insists on. The legacy blocked Backspace and
 * Delete at the first position; it is the same rule, asked rather than wired to a key handler.
 */
export function guardsThePlus(value: string, selectionStart: number | null): boolean {
  return value.startsWith('+') && selectionStart === 1
}
