import { expect, test, type APIRequestContext } from '@playwright/test'

import { testUser } from '../helpers/seedUser'
import { pathFor } from './routes'

/**
 * What each kind of page does with a cache (issue #178, `docs/conventions/rendering.md`).
 *
 * The matrix was written down before anything served a request, so this is the first thing that
 * reads it back off a running build. It found that an editor's published change never reached
 * the site: the hooks dropped the collection tag, and nothing a page renders carries one.
 */
const cacheOf = async (request: APIRequestContext, path: string) => {
  const response = await request.get(path)

  expect(response.status(), path).toBe(200)

  return response.headers()
}

/**
 * Whether a response came out of the page cache. A local server names it `x-nextjs-cache`;
 * Vercel keeps that header to itself and answers with `x-vercel-cache` instead (issue #17).
 */
const cached = (headers: Record<string, string>) =>
  headers['x-nextjs-cache'] ?? headers['x-vercel-cache']

/** The REST API as the administrator the run creates, which is how an editor's save arrives. */
async function asAdmin(request: APIRequestContext): Promise<Record<string, string>> {
  const response = await request.post('/api/users/login', {
    data: { email: testUser.email, password: testUser.password },
  })

  expect(response.status(), 'admin login').toBe(200)

  const { token } = (await response.json()) as { token?: string }

  expect(token, 'admin login returned no token').toBeTruthy()

  return { Authorization: `JWT ${token}` }
}

test.describe('what a page type does with a cache', () => {
  test('a content page is prerendered rather than rendered per visitor', async ({ request }) => {
    // The build output says the same thing; this is the running server agreeing with it. The
    // headers are read for their presence rather than their value: a save anywhere on the site
    // drops every entry, so whether this one is HIT or freshly re-rendered is a matter of
    // timing, while a page rendered per request carries neither header at all.
    const headers = await cacheOf(request, pathFor('/partners', 'en'))

    expect(headers['x-nextjs-prerender']).toBeTruthy()
    expect(cached(headers)).toBeTruthy()
  })

  test('the sitemaps and robots come from a cache entry too', async ({ request }) => {
    for (const path of ['/sitemap.xml', '/aircraft/sitemap.xml', '/yachts/sitemap.xml']) {
      expect(cached(await cacheOf(request, path)), path).toBeTruthy()
    }
  })

  test('a listing answers the query it was asked, never another one', async ({ request }) => {
    // It is rendered on demand because the sort and the page come from `searchParams` (#135);
    // what matters is that no cache ever answers one query with another's result.
    const ascending = await (await request.get(pathFor('/aircraft?sort=range', 'en'))).text()
    const descending = await (
      await request.get(pathFor('/aircraft?sort=range&direction=desc', 'en'))
    ).text()

    expect(ascending).not.toBe(descending)
  })
})

test.describe('an editor saving a page', () => {
  test('changes what the next visitor is served', async ({ request }) => {
    const headers = await asAdmin(request)
    // A page of the run's own: the run shares staging with its editors and with the run of the
    // next commit, and a title put back after an edit can only be the one it found (issue #17).
    const slug = `e2e-caching-${Date.now()}`
    const created = await request.post('/api/pages', {
      headers,
      data: { title: `Before ${slug}`, slug, layout: [], _status: 'published' },
    })

    expect(created.status()).toBe(201)

    const { doc } = (await created.json()) as { doc: { id: number | string } }
    const served = async () => (await request.get(pathFor(`/${slug}`, 'en'))).text()

    try {
      // Read once before the save, so there is a rendered page for the save to replace.
      await expect.poll(served, { timeout: 15_000 }).toContain(`Before ${slug}`)

      const saved = await request.patch(`/api/pages/${doc.id}`, {
        headers,
        data: { title: `After ${slug}`, _status: 'published' },
      })

      expect(saved.status()).toBe(200)

      // The hooks drop the rendered pages inside the request that saved, so a local server's
      // next answer is already re-rendered; before #178 it served the old title for ever. A
      // deployment purges its edge cache too, but the region this runs against hears of it a
      // moment after the one that saved (issue #17), hence the poll rather than one read.
      await expect.poll(served, { timeout: 15_000 }).toContain(`After ${slug}`)
    } finally {
      await request.delete(`/api/pages/${doc.id}`, { headers })
    }
  })
})
