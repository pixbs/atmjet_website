import createIntlProxy from 'next-intl/middleware'

import { routing } from './i18n/routing'

/**
 * Locale routing at the network boundary. Next 16 renamed the `middleware` file convention to
 * `proxy` (node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md);
 * next-intl still ships the handler under `next-intl/middleware`.
 *
 * The handler redirects unprefixed paths to the detected locale and serves prefixed ones
 * as-is, reproducing docs/legacy-inventory.md section 2.2. Unlike the legacy middleware it
 * does not read `defaultLocale` from the client-controllable `x-default-locale` header.
 */
export default createIntlProxy(routing)

export const config = {
  // Next parses this field statically, so it has to be a literal: everything except the Payload
  // admin, the API routes, Next and Vercel internals and paths with a file extension
  // (docs/legacy-inventory.md section 2.2 plus `admin`). tests/e2e/i18n.e2e.spec.ts covers it.
  matcher: ['/((?!admin|api|_next|_vercel|.*\\..*).*)'],
}
