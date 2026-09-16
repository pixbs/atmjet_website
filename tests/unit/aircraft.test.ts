import { describe, expect, it } from 'vitest'

import { canonicalRegistration, registrationsInSlug } from '@/lib/aircraft'

/**
 * Aircraft value handling (issue #63). The registration rule decides which legacy rows E5.7
 * merges, and the number formatters decide whether a ported detail page shows the same text the
 * legacy one did, so both are parity concerns rather than style.
 */
describe('canonicalRegistration', () => {
  it('matches the rule the legacy comparison used', () => {
    // docs/legacy-inventory.md section 8: upper(replace(x, '-', '')).
    expect(canonicalRegistration('RA-73025')).toBe('RA73025')
    expect(canonicalRegistration('ra-73025')).toBe('RA73025')
    expect(canonicalRegistration('RA 73025')).toBe('RA73025')
    expect(canonicalRegistration('RA73025')).toBe('RA73025')
  })

  it('gives one key to every spelling of the same aircraft', () => {
    const spellings = ['M-ABCD', 'm-abcd', ' M ABCD ', 'MABCD']
    const keys = new Set(spellings.map((entry) => canonicalRegistration(entry)))

    expect(keys.size).toBe(1)
  })

  it('leaves characters other than separators alone', () => {
    // Deleting anything else would merge two aircraft that are not the same.
    expect(canonicalRegistration('N1.23A')).toBe('N1.23A')
    expect(canonicalRegistration('OE/LAB')).toBe('OE/LAB')
  })

  it('treats a blank or absent registration as missing', () => {
    expect(canonicalRegistration('')).toBeUndefined()
    expect(canonicalRegistration('  -  ')).toBeUndefined()
    expect(canonicalRegistration(null)).toBeUndefined()
    expect(canonicalRegistration(7)).toBeUndefined()
  })
})

/**
 * The registration a detail-page slug names (issue #138, `docs/legacy-inventory.md` section 4).
 * The legacy page split the slug on `-` and read the first two parts, so `RA-73025-gulfstream`
 * asked for `RA-73025`; a bare registration and a slug written without the hyphen answer too.
 */
describe('registrationsInSlug', () => {
  it('reads the registration out of the slug the listing card writes', () => {
    expect(registrationsInSlug('RA-73025-gulfstream-g650')).toContain('RA73025')
  })

  it('takes a slug of one part as the registration itself', () => {
    expect(registrationsInSlug('MOUSE')).toEqual(['MOUSE'])
  })

  it('offers the whole slug as well, for a registration written without its hyphen', () => {
    // `T7-ATM` and `T7ATM` are one aircraft to the comparison the legacy merge used.
    expect(registrationsInSlug('T7-ATM')).toEqual(['T7ATM'])
    expect(registrationsInSlug('9H-ATM-legacy-650')).toEqual(['9HATM', '9HATMLEGACY650'])
  })

  it('offers nothing for a slug with nothing in it', () => {
    expect(registrationsInSlug('')).toEqual([])
    expect(registrationsInSlug('---')).toEqual([])
  })
})
