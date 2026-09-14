import { describe, expect, it } from 'vitest'

import { LOCALE_DEFINITIONS } from '@/i18n/locales'
import { localeSwitchHref } from '@/lib/urls'

/**
 * The language links of the chrome (issue #90), reproducing `elements/localeSwitcher.tsx`
 * (`docs/legacy-inventory.md` section 3.6). What the visitor sees of them — the dimmed current
 * language, the languages on offer — is asserted against the rendered markup in
 * `tests/e2e/locale-switch.e2e.spec.ts`; this is the URL the links carry.
 */
describe('localeSwitchHref', () => {
  it('keeps the visitor on the page they were reading', () => {
    expect(localeSwitchHref('/empty_legs', '')).toBe('/empty_legs')
  })

  it('carries the query across the switch', () => {
    // The legacy site opened the booking dialog from `?showBooking`, so losing it closed it.
    expect(localeSwitchHref('/aircraft', 'showBooking=1')).toBe('/aircraft?showBooking=1')
    expect(localeSwitchHref('/aircraft', '?showBooking=1')).toBe('/aircraft?showBooking=1')
  })

  it('ends the URL without a bare question mark when there is nothing to carry', () => {
    // The legacy switcher always appended one (section 13, entry 74).
    expect(localeSwitchHref('/', '')).toBe('/')
    expect(localeSwitchHref('/', '?')).toBe('/')
  })
})

describe('the languages on offer', () => {
  it('gives every language the short label the legacy switcher showed', () => {
    const short = Object.fromEntries(LOCALE_DEFINITIONS.map((one) => [one.code, one.short]))

    expect(short).toMatchObject({ en: 'Eng', ru: 'Рус' })
  })
})
