import { describe, expect, it } from 'vitest'

import { servedStatusFor } from '@/collections/Redirects'
import {
  bySpecificity,
  DEFAULT_REDIRECT_STATUS,
  matchRedirect,
  normaliseRedirectPath,
  type RedirectRule,
} from '@/lib/redirects'

/**
 * Redirect matching (issue #69). The five rules the legacy `next.config.mjs` shipped are the
 * reference (`docs/legacy-inventory.md` section 1.3); two of them carried a dynamic segment
 * through to the target, which is what `matchSubPaths` replaces.
 */
const legacy: RedirectRule[] = [
  { from: '/jets', to: '/', type: '308' },
  { from: '/planes', to: '/aircraft', matchSubPaths: true, type: '308' },
  { from: '/aircrafts', to: '/aircraft', matchSubPaths: true, type: '308' },
]

describe('normaliseRedirectPath', () => {
  it('gives every path one spelling', () => {
    expect(normaliseRedirectPath('/planes')).toBe('/planes')
    expect(normaliseRedirectPath('planes')).toBe('/planes')
    expect(normaliseRedirectPath('/planes/')).toBe('/planes')
    expect(normaliseRedirectPath('/planes///')).toBe('/planes')
    expect(normaliseRedirectPath('  /planes  ')).toBe('/planes')
  })

  it('drops a query string and a fragment, which are not part of the match', () => {
    expect(normaliseRedirectPath('/planes?utm_source=x')).toBe('/planes')
    expect(normaliseRedirectPath('/planes#gallery')).toBe('/planes')
  })

  it('calls the root a slash, so it cannot match a rule by both being empty', () => {
    expect(normaliseRedirectPath('')).toBe('/')
    expect(normaliseRedirectPath('/')).toBe('/')
    expect(normaliseRedirectPath(undefined)).toBe('/')
    expect(normaliseRedirectPath(42)).toBe('/')
  })
})

describe('matchRedirect', () => {
  it('sends the legacy paths where the legacy config sent them', () => {
    expect(matchRedirect(legacy, '/jets', 'en')).toEqual({ destination: '/en', status: 308 })
    expect(matchRedirect(legacy, '/planes', 'en')).toEqual({
      destination: '/en/aircraft',
      status: 308,
    })
    expect(matchRedirect(legacy, '/aircrafts', 'ru')).toEqual({
      destination: '/ru/aircraft',
      status: 308,
    })
  })

  it('carries a dynamic segment over, which is what /planes/:id meant', () => {
    expect(matchRedirect(legacy, '/planes/g650', 'en')?.destination).toBe('/en/aircraft/g650')
    expect(matchRedirect(legacy, '/aircrafts/ra-73025', 'ru')?.destination).toBe(
      '/ru/aircraft/ra-73025',
    )
    expect(matchRedirect(legacy, '/planes/deep/er/still', 'en')?.destination).toBe(
      '/en/aircraft/deep/er/still',
    )
  })

  it('does not catch the paths below a rule that did not ask for them', () => {
    // /jets was an exact redirect; /jets/anything was a 404 and stays one.
    expect(matchRedirect(legacy, '/jets/g650', 'en')).toBeUndefined()
  })

  it('does not match a path that merely starts with the same letters', () => {
    expect(matchRedirect(legacy, '/planesomething', 'en')).toBeUndefined()
  })

  it('puts the visitor back in their own language', () => {
    expect(matchRedirect(legacy, '/planes', 'ru')?.destination).toBe('/ru/aircraft')
    expect(matchRedirect(legacy, '/jets', 'ru')?.destination).toBe('/ru')
  })

  it('leaves an absolute target alone, because another host has no locale of ours', () => {
    const rules: RedirectRule[] = [
      { from: '/brochure', to: 'https://example.test/files', matchSubPaths: true },
    ]

    expect(matchRedirect(rules, '/brochure', 'en')?.destination).toBe('https://example.test/files')
    expect(matchRedirect(rules, '/brochure/2025.pdf', 'ru')?.destination).toBe(
      'https://example.test/files/2025.pdf',
    )
  })

  it('applies a locale-scoped rule to that locale only', () => {
    const rules: RedirectRule[] = [{ from: '/privacy', to: '/privacy_ru', locale: 'ru' }]

    expect(matchRedirect(rules, '/privacy', 'ru')?.destination).toBe('/ru/privacy_ru')
    expect(matchRedirect(rules, '/privacy', 'en')).toBeUndefined()
  })

  it('falls back to the legacy permanent status when a rule does not say', () => {
    expect(matchRedirect([{ from: '/jets', to: '/' }], '/jets', 'en')?.status).toBe(
      DEFAULT_REDIRECT_STATUS,
    )
    expect(matchRedirect([{ from: '/a', to: '/b', type: 'nonsense' }], '/a', 'en')?.status).toBe(
      308,
    )
    expect(matchRedirect([{ from: '/a', to: '/b', type: '302' }], '/a', 'en')?.status).toBe(302)
  })

  it('skips a rule with nowhere to send anybody rather than redirecting to nothing', () => {
    const rules: RedirectRule[] = [
      { from: '/planes', to: '   ' },
      { from: '/planes', to: '/aircraft' },
    ]

    expect(matchRedirect(rules, '/planes', 'en')?.destination).toBe('/en/aircraft')
    expect(matchRedirect([{ from: '/planes', to: 42 as never }], '/planes', 'en')).toBeUndefined()
  })

  it('finds nothing for a path nobody wrote a rule for', () => {
    expect(matchRedirect(legacy, '/yachts', 'en')).toBeUndefined()
    expect(matchRedirect([], '/planes', 'en')).toBeUndefined()
  })
})

describe('bySpecificity', () => {
  it('puts the longest path first, so a sub-path rule cannot swallow an exact one', () => {
    const rules: RedirectRule[] = [
      { from: '/planes', to: '/aircraft', matchSubPaths: true },
      { from: '/planes/legacy', to: '/archive' },
    ]

    const sorted = [...rules].sort(bySpecificity)

    expect(sorted.map((rule) => rule.from)).toEqual(['/planes/legacy', '/planes'])
    expect(matchRedirect(sorted, '/planes/legacy', 'en')?.destination).toBe('/en/archive')
    // Anything else below /planes still falls through to the sub-path rule, remainder and all.
    expect(matchRedirect(sorted, '/planes/other', 'en')?.destination).toBe('/en/aircraft/other')
  })

  it('is stable for two paths of the same length', () => {
    expect(bySpecificity({ from: '/aaa', to: '/x' }, { from: '/bbb', to: '/y' })).toBeLessThan(0)
    expect(bySpecificity({ from: '/bbb', to: '/x' }, { from: '/aaa', to: '/y' })).toBeGreaterThan(0)
    expect(bySpecificity({ from: '/aaa', to: '/x' }, { from: '/aaa', to: '/y' })).toBe(0)
  })
})

describe('servedStatusFor', () => {
  it('serves the permanent pair as 308 and the temporary ones as 307', () => {
    // A server component cannot emit 301 or 302; both pairs mean the same thing to a crawler.
    expect(servedStatusFor(308)).toBe(308)
    expect(servedStatusFor(301)).toBe(308)
    expect(servedStatusFor(307)).toBe(307)
    expect(servedStatusFor(302)).toBe(307)
    expect(servedStatusFor(303)).toBe(307)
  })
})
