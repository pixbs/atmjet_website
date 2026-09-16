import { describe, expect, it } from 'vitest'

import { servedLocales } from '@/lib/pages'

/**
 * Which languages a page answers in (issue #149, `docs/legacy-inventory.md` section 4). The
 * legacy citizens page was Russian only and said so by redirecting everyone else from inside
 * its own component; here it is a field, and what it decides is where a page is prerendered,
 * what the sitemap lists, and who gets sent to the home page.
 */
const ENABLED = ['en', 'ru'] as const

describe('the languages a page answers in', () => {
  it('is every one the site serves when the page names none', () => {
    // Which is every page but one: naming nothing is what a page that answers everywhere does.
    expect(servedLocales(undefined, ENABLED)).toEqual(['en', 'ru'])
    expect(servedLocales([], ENABLED)).toEqual(['en', 'ru'])
  })

  it('is the ones it names, and no others', () => {
    expect(servedLocales(['ru'], ENABLED)).toEqual(['ru'])
  })

  it('keeps the order the site serves them in, so the first is still the canonical one', () => {
    expect(servedLocales(['ru', 'en'], ENABLED)).toEqual(['en', 'ru'])
  })

  it('ignores a language the site does not serve, rather than offering it', () => {
    // `uk` is entered in the admin and not served until somebody enables it (ADR-0003); a page
    // that named it would otherwise advertise a URL that answers 404.
    expect(servedLocales(['ru', 'uk'], ENABLED)).toEqual(['ru'])
  })

  it('falls back to every served language when it names only ones that are not', () => {
    // Better every language than none: a page nobody can reach is worse than one too many.
    expect(servedLocales(['uk'], ENABLED)).toEqual(['en', 'ru'])
  })
})
