import { describe, expect, it } from 'vitest'

import { ACCEPT_ALL, consentCookies, readConsent, REJECT_ALL } from '@/lib/consent'

/**
 * What a visitor has agreed to (issue #91, `docs/legacy-inventory.md` section 3.7). The legacy
 * site wrote these three cookies and then read none of them; here they are the only thing that
 * decides whether the site is allowed to measure a visit.
 */
describe('reading an answer', () => {
  it('finds nothing where the visitor has not been asked', () => {
    expect(readConsent('')).toBeNull()
    expect(readConsent('other=true; still-not=consent')).toBeNull()
    // The flag the legacy set on every answer; without it, the rest means nothing.
    expect(readConsent('marketing-consent=true')).toBeNull()
  })

  it('reads what was agreed to, and what was refused', () => {
    expect(
      readConsent('cookie-consent=true; marketing-consent=true; personal-consent=true'),
    ).toEqual(ACCEPT_ALL)
    expect(
      readConsent('cookie-consent=true; marketing-consent=false; personal-consent=false'),
    ).toEqual(REJECT_ALL)
    // An answer that only agreed to one of the two.
    expect(readConsent('cookie-consent=true; marketing-consent=true')).toEqual({
      marketing: true,
      personal: false,
    })
  })

  it('is not confused by another cookie whose name ends the same way', () => {
    expect(readConsent('not-cookie-consent=true; cookie-consent=true')).toEqual(REJECT_ALL)
  })
})

describe('writing an answer', () => {
  it('keeps every answer for as long as the legacy kept its longest', () => {
    // The banner wrote session cookies and the modal wrote year-long ones, so answering in the
    // banner meant being asked again on the next visit (section 13, entry 71).
    for (const cookie of consentCookies(ACCEPT_ALL)) {
      // `60 * 525960` seconds, the legacy modal's own figure: a quarter-day over a year.
      expect(cookie).toContain('Max-Age=31557600')
      expect(cookie).toContain('Path=/')
      expect(cookie).toContain('SameSite=Lax')
    }
  })

  it('says yes to what was agreed to and no to the rest, and that the question was answered', () => {
    expect(consentCookies({ marketing: true, personal: false })).toEqual([
      expect.stringContaining('marketing-consent=true'),
      expect.stringContaining('personal-consent=false'),
      expect.stringContaining('cookie-consent=true'),
    ])
  })

  it('is read back as what was written', () => {
    const written = consentCookies({ marketing: true, personal: false })
      .map((cookie) => cookie.split(';')[0])
      .join('; ')

    expect(readConsent(written)).toEqual({ marketing: true, personal: false })
  })
})
