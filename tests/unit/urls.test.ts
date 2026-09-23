import { describe, expect, it, vi } from 'vitest'

import { internalPath, localeUrl, localeUrls, siteOrigin } from '@/lib/urls'

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
    // A clone without the variable set advertises itself, never the legacy hard-coded host.
    // Blank rather than absent: an absent argument reads this machine's own `.env`.
    expect(siteOrigin('', '')).toBe('http://localhost:3000')
    expect(siteOrigin('  ', '')).toBe('http://localhost:3000')
  })

  it('names the production domain Vercel provides when no variable overrides it', () => {
    // A deployment needs no variable of its own (#403); Vercel's holds a bare host.
    expect(siteOrigin('', 'atmjetwebsiterefactor.vercel.app')).toBe(
      'https://atmjetwebsiterefactor.vercel.app',
    )
    expect(siteOrigin('https://atmjet.com', 'atmjetwebsiterefactor.vercel.app')).toBe(
      'https://atmjet.com',
    )
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

/**
 * `metadataBase` is `new URL(siteOrigin())` and it runs while a page is prerendered (issue #55),
 * so a value `new URL` refuses fails the build rather than one page. Whatever an environment
 * holds, the origin has to be something it accepts.
 */
describe('the origin metadataBase is built from', () => {
  it.each([
    ['a bare deployment host', 'atmjet.vercel.app'],
    ['an address with its scheme', 'https://atmjet.com'],
    ['one with a trailing slash', 'https://atmjet.com/'],
    ['nothing at all', ''],
    ['something that is not an address', 'not an address'],
  ])('is an address for %s', (_case, configured) => {
    expect(() => new URL(siteOrigin(configured))).not.toThrow()
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

describe('internalPath', () => {
  it('leaves a path that is already rooted where it is', () => {
    expect(internalPath('/aircraft')).toBe('/aircraft')
  })

  it('roots a path that was stored without a slash', () => {
    expect(internalPath('sales_dept')).toBe('/sales_dept')
  })

  it('closes up the gap the legacy card left', () => {
    // `/${locale}/${href}` around an href that already had a slash: every card on
    // `/atm_jet_group` linked to `/en//aircraft` (`docs/legacy-inventory.md` section 13, 9).
    expect(internalPath('//aircraft')).toBe('/aircraft')
    expect(internalPath('/aircraft//old')).toBe('/aircraft/old')
  })

  it('drops a trailing slash, so one page is one URL', () => {
    expect(internalPath('/yachts/')).toBe('/yachts')
  })

  it('reads an empty path as the home page', () => {
    expect(internalPath('')).toBe('/')
    expect(internalPath('/')).toBe('/')
  })
})
