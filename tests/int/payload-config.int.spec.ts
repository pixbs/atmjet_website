import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Where Payload thinks this deployment answers (issue #265).
 *
 * Deployments hold a bare host in `NEXT_PUBLIC_SITE_URL` — `atmjetwebsiterefactor.vercel.app`,
 * no scheme — and Payload cannot make a URL of one. It does not throw: it logs
 * `Failed to create URL object from URL: …, falling back to http://localhost` and carries on,
 * so the admin's live preview opened `http://localhost/en/partners` for every editor and the
 * CORS list named localhost rather than the site.
 *
 * The config is built when the module is imported, so each case imports it afresh with the
 * environment it is asking about.
 */
const CONFIGURED = process.env.NEXT_PUBLIC_SITE_URL

async function serverURLFrom(configured: string | undefined): Promise<string> {
  vi.resetModules()

  if (configured === undefined) delete process.env.NEXT_PUBLIC_SITE_URL
  else process.env.NEXT_PUBLIC_SITE_URL = configured

  const { default: config } = await import('@/payload.config')

  return (await config).serverURL ?? ''
}

beforeEach(() => vi.resetModules())

afterAll(() => {
  if (CONFIGURED === undefined) delete process.env.NEXT_PUBLIC_SITE_URL
  else process.env.NEXT_PUBLIC_SITE_URL = CONFIGURED
})

describe('the Payload server URL', () => {
  it('gives a bare host the scheme Payload needs to make a URL of it', async () => {
    expect(await serverURLFrom('atmjetwebsiterefactor.vercel.app')).toBe(
      'https://atmjetwebsiterefactor.vercel.app',
    )
  })

  it('leaves an address that already has a scheme alone', async () => {
    expect(await serverURLFrom('https://atmjet.com')).toBe('https://atmjet.com')
  })

  it('answers on localhost when nothing is configured', async () => {
    expect(await serverURLFrom(undefined)).toBe('http://localhost:3000')
  })

  it('pins CORS and CSRF to that same origin, not to the raw variable', async () => {
    // An origin is matched by string, so a bare host in the allow-list would match nothing and
    // stop protecting anything without saying so (issue #70). Payload keeps the server URL in
    // the list itself, so what matters is which spelling is in it.
    vi.resetModules()
    process.env.NEXT_PUBLIC_SITE_URL = 'atmjetwebsiterefactor.vercel.app'
    const config = await (await import('@/payload.config')).default

    for (const list of [config.cors, config.csrf]) {
      expect(list).toContain('https://atmjetwebsiterefactor.vercel.app')
      expect(list).not.toContain('atmjetwebsiterefactor.vercel.app')
    }
  })
})
