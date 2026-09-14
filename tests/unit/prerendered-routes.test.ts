import { describe, expect, it } from 'vitest'

import {
  METADATA_ROUTES,
  expectedRoutes,
  missingRoutes,
  routesFromManifest,
} from '../../scripts/ci/prerendered-routes'
import { PAGE_SLUGS } from '@/collections/Pages'
import { DEFAULT_LOCALES } from '@/i18n/locales'

/**
 * What a finished build owes (issue #178). A build against an empty database prerenders nothing
 * and still succeeds, because an empty result is the legitimate answer for an environment with no
 * content yet; that is how CI built a site of zero pages without failing (#252).
 */
describe('expectedRoutes', () => {
  it('asks for every page of the site in every language it serves', () => {
    const routes = expectedRoutes(['en', 'ru'], ['', 'yachts'])

    expect(routes).toEqual(['/en', '/en/yachts', '/ru', '/ru/yachts', ...METADATA_ROUTES])
  })

  it('puts the home page at the locale root rather than at /en/home', () => {
    expect(expectedRoutes(['en'], [''])).toContain('/en')
    expect(expectedRoutes(['en'], [''])).not.toContain('/en/')
  })

  it('counts the static routes the collection defines, not a copy of them', () => {
    // A route added to PAGE_SLUGS is expected here without anybody remembering to add it.
    const routes = expectedRoutes()

    expect(routes).toHaveLength(DEFAULT_LOCALES.length * PAGE_SLUGS.length + METADATA_ROUTES.length)
  })

  it('expects robots and the sitemap, which live outside the locale segment', () => {
    expect(expectedRoutes()).toEqual(expect.arrayContaining(['/robots.txt', '/sitemap.xml']))
  })
})

describe('missingRoutes', () => {
  it('says nothing when the build rendered everything it owed', () => {
    expect(missingRoutes(['/en', '/ru'], ['/en', '/ru', '/en/styleguide'])).toEqual([])
  })

  it('names what the build left out', () => {
    expect(missingRoutes(['/en', '/en/yachts', '/ru'], ['/en'])).toEqual(['/en/yachts', '/ru'])
  })
})

describe('routesFromManifest', () => {
  it('reads the routes Next says it prerendered', () => {
    expect(routesFromManifest({ routes: { '/en': {}, '/robots.txt': {} } })).toEqual([
      '/en',
      '/robots.txt',
    ])
  })

  it('refuses a manifest with nothing in it rather than reporting success', () => {
    // Without this, a missing or half-written manifest would read as "no routes are missing".
    expect(() => routesFromManifest({})).toThrow(/was the build run/)
    expect(() => routesFromManifest(null)).toThrow(/was the build run/)
  })
})
