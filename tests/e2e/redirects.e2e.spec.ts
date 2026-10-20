import { expect, test } from '@playwright/test'

import { ENABLED_LOCALES, pathFor } from './routes'

/**
 * The seeded legacy redirects answer on a running site (issues #69 and #172): the static rules
 * `next.config.mjs` shipped (`docs/legacy-inventory.md` section 1.3), and one rule per aircraft
 * where the legacy `/planes/:id` and `/aircrafts/:id` were patterns. `MOUSE` is a seeded
 * aircraft, served at its canonical registration.
 *
 * A server component can only emit 307 or 308, so the legacy `permanent: true` arrives as 308.
 */
const CASES = [
  { from: '/planes', to: '/aircraft' },
  { from: '/planes/MOUSE', to: '/aircraft/MOUSE' },
  { from: '/aircrafts', to: '/aircraft' },
  { from: '/aircrafts/MOUSE', to: '/aircraft/MOUSE' },
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

    test(`[${locale}] an old aircraft URL naming no aircraft is a 404`, async ({ request }) => {
      // The legacy pattern sent it on to a detail page that bounced to the listing (#172).
      const response = await request.get(pathFor('/planes/no-such-aircraft', locale))

      expect(response.status()).toBe(404)
    })

    test(`[${locale}] a path below an exact rule is still a 404`, async ({ request }) => {
      // /jets was an exact redirect in the legacy config; /jets/anything was never one.
      const response = await request.get(pathFor('/jets/g650', locale))

      expect(response.status()).toBe(404)
    })
  }
})
