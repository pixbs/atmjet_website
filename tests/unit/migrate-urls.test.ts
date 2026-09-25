import { describe, expect, it } from 'vitest'

import { legacyPaths, unanswered } from '../../scripts/migrate/urls'

/**
 * The legacy URLs the new site must answer (issue #85): what the legacy sitemaps and cards
 * published, and what counts as an answer.
 */
describe('the URLs the legacy site published', () => {
  const paths = legacyPaths({
    tailNumbers: ['RA-73025', '', 'RA-73025'],
    catalogueSlugs: ['gulfstream-g650-ra-73025'],
    charterSlugs: ['sea_breeze', ''],
  })

  it('are the static sitemap, unprefixed and in both languages', () => {
    expect(paths).toEqual(
      expect.arrayContaining(['/', '/en', '/ru', '/sales_dept', '/ru/partners']),
    )
    expect(paths).not.toContain('/citezens')
  })

  it('are every plane of the aircraft sitemap, once, and every detail page a card linked to', () => {
    expect(paths.filter((path) => path.includes('RA-73025') && !path.includes('g650'))).toEqual([
      '/aircraft/RA-73025',
      '/en/aircraft/RA-73025',
      '/ru/aircraft/RA-73025',
    ])
    expect(paths).toContain('/en/aircraft/gulfstream-g650-ra-73025')
    expect(paths).toContain('/en/yachts/sea_breeze')
    expect(paths).not.toContain('/en/yachts/')
  })
})

describe('an answer', () => {
  /** A site that redirects by the table it is given and answers the rest with their status. */
  const site =
    (routes: Record<string, number | string>) =>
    async (url: string): Promise<Response> => {
      const route = routes[new URL(url).pathname] ?? 404

      return typeof route === 'string'
        ? new Response(null, { status: 308, headers: { location: route } })
        : new Response(null, { status: route })
    }

  it('is a page answering 200, directly or through redirects on the same host', async () => {
    const fetcher = site({ '/planes': '/en/aircraft', '/en/aircraft': 200, '/en': 200 })

    expect(await unanswered('https://staging.example', ['/planes', '/en'], { fetcher })).toEqual([])
  })

  it('is not a 404, a redirect to another host, or a loop', async () => {
    const fetcher = site({
      '/gone': 404,
      '/away': 'https://elsewhere.example/page',
      '/loop': '/loop',
      '/moved': '/also-gone',
    })

    expect(
      await unanswered('https://staging.example', ['/gone', '/away', '/loop', '/moved'], {
        fetcher,
      }),
    ).toEqual([
      { path: '/away', status: 308, location: 'https://elsewhere.example/page' },
      { path: '/gone', status: 404 },
      { path: '/loop', status: 310, location: '/loop' },
      { path: '/moved', status: 404, location: '/also-gone' },
    ])
  })

  it('carries the bypass header a protected preview asks for', async () => {
    const seen: (string | null)[] = []
    const fetcher = async (_url: string, init: RequestInit) => {
      seen.push(new Headers(init.headers).get('x-vercel-protection-bypass'))
      return new Response(null, { status: 200 })
    }

    await unanswered('https://staging.example', ['/en'], { fetcher, bypass: 'secret' })

    expect(seen).toEqual(['secret'])
  })
})
