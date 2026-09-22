import { expect, test, type APIRequestContext } from '@playwright/test'

/**
 * The hosts `next/image` may fetch from (issue #20). The media migration writes rows before it
 * mirrors the files, so a Media document can name a legacy host in `externalUrl` and
 * `mediaSource` hands that address straight to `next/image` (`src/lib/media.ts`, E5.12) — which
 * refuses a host `remotePatterns` does not carry, whatever the file at the end of it.
 *
 * The legacy site allowed exactly these two (`docs/legacy-inventory.md` section 2.1).
 */
const REFUSED = '"url" parameter is not allowed'

const optimised = (request: APIRequestContext, url: string) =>
  request.get(`/_next/image?url=${encodeURIComponent(url)}&w=640&q=75`)

test.describe('the hosts an image may come from', () => {
  for (const host of [
    'atmjet.s3.eu-north-1.amazonaws.com',
    'atmjet.ams3.cdn.digitaloceanspaces.com',
  ])
    test(`${host} is one the optimiser will fetch from`, async ({ request }) => {
      const response = await optimised(request, `https://${host}/media/does-not-exist.jpg`)

      // What the file at the end of it answers is the bucket's business and differs per
      // environment; what this asserts is that the address was allowed to be asked at all.
      expect(await response.text()).not.toContain(REFUSED)
      expect(response.status()).not.toBe(400)
    })

  test('anywhere else is refused, so a stray URL cannot be proxied through this site', async ({
    request,
  }) => {
    const response = await optimised(request, 'https://example.com/a.jpg')

    expect(response.status()).toBe(400)
    expect(await response.text()).toContain(REFUSED)
  })
})
