import createIntlProxy from 'next-intl/middleware'
import type { NextRequest } from 'next/server'

import { routing } from './i18n/routing'
import type { Locale } from './i18n/locales'
import { getEnabledLocales } from './lib/data/site-settings'

/**
 * Locale routing at the network boundary. Next 16 renamed the `middleware` file convention to
 * `proxy` (node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md);
 * next-intl still ships the handler under `next-intl/middleware`.
 *
 * The handler redirects unprefixed paths to the detected locale and serves prefixed ones
 * as-is, reproducing docs/legacy-inventory.md section 2.2. Unlike the legacy middleware it
 * does not read `defaultLocale` from the client-controllable `x-default-locale` header.
 *
 * Which locales it routes comes from `SiteSettings.enabledLocales` (issue #53), so enabling a
 * language in the admin makes its URLs work without a deploy. A locale that is not enabled is
 * not a locale as far as routing is concerned: its prefix is read as an ordinary path, which
 * ends at the not-found page, and detection never sends a visitor to it.
 */

/** One handler per set of enabled locales; there are at most a handful, and they never change. */
const handlers = new Map<string, ReturnType<typeof createIntlProxy>>()

function handlerFor(locales: Locale[]): ReturnType<typeof createIntlProxy> {
  const key = locales.join(',')
  let handler = handlers.get(key)

  if (!handler) {
    handler = createIntlProxy({ ...routing, locales })
    handlers.set(key, handler)
  }

  return handler
}

/**
 * The proxy runs before every page request, so the setting is held for a minute rather than
 * read per request. That is the delay between an editor enabling a language and its URLs
 * answering; the pages themselves read the global directly and are dropped by its hook.
 */
const TTL_MS = 60_000

let cached: { locales: Locale[]; readAt: number } | undefined

async function enabledLocales(): Promise<Locale[]> {
  if (!cached || Date.now() - cached.readAt > TTL_MS) {
    cached = { locales: await getEnabledLocales(), readAt: Date.now() }
  }

  return cached.locales
}

export default async function proxy(request: NextRequest) {
  return handlerFor(await enabledLocales())(request)
}

export const config = {
  // Next parses this field statically, so it has to be a literal: everything except the Payload
  // admin, the API routes, Next and Vercel internals and paths with a file extension
  // (docs/legacy-inventory.md section 2.2 plus `admin`). tests/e2e/i18n.e2e.spec.ts covers it.
  matcher: ['/((?!admin|api|_next|_vercel|.*\\..*).*)'],
}
