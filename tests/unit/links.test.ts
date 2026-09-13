import { describe, expect, it } from 'vitest'

import {
  instagramHref,
  mailtoHref,
  SOCIAL_NETWORKS,
  telHref,
  telegramHref,
  whatsAppHref,
} from '@/lib/links'

/**
 * The URL builders behind the chrome links (issue #61). The legacy site wrote these by hand in
 * six components and got two of them wrong: a Telegram channel link no browser can open and a
 * `tel:` pointing at a different phone than the one on screen
 * (`docs/legacy-inventory.md` sections 9.5 and 13).
 */
describe('phone links', () => {
  it('dials the number that is displayed', () => {
    expect(telHref('+971 (50) 458-99-26')).toBe('tel:+971504589926')
  })

  it('sends the same number to WhatsApp, which wants it without a plus', () => {
    expect(whatsAppHref('+971 (50) 458-99-26')).toBe('https://wa.me/971504589926')
  })

  it('has nothing to link to when no number is set', () => {
    expect(telHref('')).toBe('')
    expect(whatsAppHref('  ')).toBe('')
  })
})

describe('telegram links', () => {
  it('builds an account link from the bare handle', () => {
    expect(telegramHref('melentev1')).toBe('https://t.me/melentev1')
  })

  it('opens the empty-legs channel, which the legacy link could not', () => {
    // Legacy: tg:\\nesolve?domain=@atmjet1
    expect(telegramHref('@atmjet1')).toBe('https://t.me/atmjet1')
  })

  it('accepts a pasted profile URL', () => {
    expect(telegramHref('https://t.me/melentev1')).toBe('https://t.me/melentev1')
  })

  it('has nothing to link to when no account is set', () => {
    expect(telegramHref('@')).toBe('')
  })
})

describe('other links', () => {
  it('keeps the trailing slash the legacy Instagram link had', () => {
    expect(instagramHref('atmjet')).toBe('https://www.instagram.com/atmjet/')
    expect(instagramHref('https://www.instagram.com/atmjet/')).toBe(
      'https://www.instagram.com/atmjet/',
    )
  })

  it('has nothing to link to without an Instagram account', () => {
    expect(instagramHref('')).toBe('')
  })

  it('builds a mailto from the address', () => {
    expect(mailtoHref(' info@atmjet.com ')).toBe('mailto:info@atmjet.com')
    expect(mailtoHref('')).toBe('')
  })

  it('names the three networks the chrome links to', () => {
    expect(SOCIAL_NETWORKS).toEqual(['telegram', 'whatsapp', 'instagram'])
  })
})
