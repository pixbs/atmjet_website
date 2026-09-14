import { describe, expect, it, vi } from 'vitest'

import { localeUrl, localeUrls, siteOrigin } from '@/lib/urls'

/**
 * Where a page lives (issues #171, #170). The legacy site built these in every file that needed
 * a URL, without the locale prefix and with the host written into the source
 * (`docs/legacy-inventory.md` section 2.3), which is how it advertised addresses that only
 * answer with a redirect.
 */
const ORIGIN = 'https://atmjet.com'

describe('siteOrigin', () => {
  it('drops a trailing slash, so a URL never doubles up on one', () => {
    expect(siteOrigin('https://atmjet.com/')).toBe('https://atmjet.com')
  })

  it('uses the development origin when the environment names none', () => {
    // A preview without the variable set advertises itself, never the legacy hard-coded host.
    expect(siteOrigin(undefined)).toBe('http://localhost:3000')
    expect(siteOrigin('  ')).toBe('http://localhost:3000')
  })

  it('adds the scheme a deployment host variable does not carry', () => {
    // Vercel's host variables hold a bare host, and `metadataBase` is a `new URL` that runs
    // while a page is prerendered, so a bare host there failed the whole build.
    expect(siteOrigin('atmjetwebsiterefactor.vercel.app')).toBe(
      'https://atmjetwebsiterefactor.vercel.app',
    )
    expect(() => new URL(siteOrigin('atmjet.com'))).not.toThrow()
  })

  it('leaves an address that already names its scheme alone', () => {
    expect(siteOrigin('http://localhost:3000')).toBe('http://localhost:3000')
    expect(siteOrigin('https://atmjet.com')).toBe('https://atmjet.com')
  })

  it('serves the development origin rather than failing on a value that is not an address', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    try {
      expect(siteOrigin('https://')).toBe('http://localhost:3000')
      expect(warn).toHaveBeenCalled()
    } finally {
      warn.mockRestore()
    }
  })
})

describe('localeUrl', () => {
  it('serves the home page at the locale root, not /en/home', () => {
    expect(localeUrl(ORIGIN, 'en', '')).toBe('https://atmjet.com/en')
  })

  it('prefixes every other page with its locale', () => {
    // The legacy pages linked `/empty_legs`, which only resolves through a 308.
    expect(localeUrl(ORIGIN, 'ru', 'empty_legs')).toBe('https://atmjet.com/ru/empty_legs')
  })
})

describe('localeUrls', () => {
  it('offers the page in every locale the site serves', () => {
    expect(localeUrls(ORIGIN, ['en', 'ru'], 'yachts')).toEqual({
      en: 'https://atmjet.com/en/yachts',
      ru: 'https://atmjet.com/ru/yachts',
      'x-default': 'https://atmjet.com/en/yachts',
    })
  })

  it('sends a visitor whose language it does not have to the first one it serves', () => {
    expect(localeUrls(ORIGIN, ['ru', 'uk'], '')['x-default']).toBe('https://atmjet.com/ru')
  })

  it('says nothing while the site serves no locale', () => {
    expect(localeUrls(ORIGIN, [], 'yachts')).toEqual({})
  })
})
