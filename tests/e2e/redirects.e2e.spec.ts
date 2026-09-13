import { expect, test } from '@playwright/test'

import { ENABLED_LOCALES, pathFor } from './routes'

/**
 * The seeded legacy redirects answer on a running site (issue #69). The list is the one
 * `next.config.mjs` shipped (`docs/legacy-inventory.md` section 1.3); E11.3 decides the final
 * one, and this spec grows with it.
 *
 * A server component can only emit 307 or 308, so the legacy `permanent: true` arrives as 308.
 */
const CASES = [
  { from: '/planes', to: '/aircraft' },
  { from: '/planes/g650', to: '/aircraft/g650' },
  { from: '/aircrafts', to: '/aircraft' },
  { from: '/aircrafts/ra-73025', to: '/aircraft/ra-73025' },
] as const

test.describe('legacy redirects', () => {
  for (const locale of ENABLED_LOCALES) {
    for (const { from, to } of CASES) {
      test(`[${locale}] ${from} keeps resolving, to ${to}`, async ({ request }) => {
        const response = await request.get(pathFor(from, locale), { maxRedirects: 0 })

        expect(response.status(), `${locale} ${from}`).toBe(308)
        expect(response.headers()['location']).toContain(pathFor(to, locale))
      })
    }

    test(`[${locale}] /jets goes home, as it did`, async ({ request }) => {
      const response = await request.get(pathFor('/jets', locale), { maxRedirects: 0 })

      expect(response.status()).toBe(308)
      expect(response.headers()['location']).toContain(`/${locale}`)
    })

    test(`[${locale}] a path below an exact rule is still a 404`, async ({ request }) => {
      // /jets was an exact redirect in the legacy config; /jets/anything was never one.
      const response = await request.get(pathFor('/jets/g650', locale))

      expect(response.status()).toBe(404)
    })
  }
})
