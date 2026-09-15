import { describe, expect, it } from 'vitest'

import { ACCEPT_ALL, consentCookies, consentSignals, readConsent, REJECT_ALL } from '@/lib/consent'

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

/**
 * What the answer says to Google Consent Mode (issue #174). The legacy site sent no signal at
 * all, so a refusal and an acceptance looked the same to every tag it loaded.
 */
describe('saying the answer to Google', () => {
  it('denies everything that measures a visit until it is agreed to', () => {
    const denied = consentSignals(REJECT_ALL)

    expect(denied.ad_storage).toBe('denied')
    expect(denied.ad_user_data).toBe('denied')
    expect(denied.ad_personalization).toBe('denied')
    expect(denied.analytics_storage).toBe('denied')
    expect(denied.personalization_storage).toBe('denied')
  })

  it('grants what the two answers cover, and each only what it covers', () => {
    expect(consentSignals(ACCEPT_ALL).ad_storage).toBe('granted')
    // The settings let a visitor agree to one and not the other.
    expect(consentSignals({ marketing: false, personal: true })).toMatchObject({
      ad_storage: 'denied',
      analytics_storage: 'denied',
      personalization_storage: 'granted',
    })
  })

  it('never withholds what the settings call necessary', () => {
    for (const consent of [ACCEPT_ALL, REJECT_ALL]) {
      expect(consentSignals(consent).functionality_storage).toBe('granted')
      expect(consentSignals(consent).security_storage).toBe('granted')
    }
  })
})
