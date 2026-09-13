/**
 * Which request paths locale routing is allowed to touch.
 *
 * Kept apart from `src/proxy.ts` so it can be unit-tested: the proxy module itself pulls in
 * `next/server` through next-intl, which only resolves inside the Next runtime.
 *
 * Everything is matched except the Payload admin, the Payload and Next API routes, Next and
 * Vercel internals, and any path containing a dot (sitemaps, robots.txt, videos, images).
 * This is the legacy matcher of docs/legacy-inventory.md section 2.2 plus `admin`, which the
 * legacy site did not serve.
 */
export const PROXY_MATCHER = ['/((?!admin|api|_next|_vercel|.*\\..*).*)'] as const

/** Whether locale routing runs for a pathname. Mirrors how Next applies the matcher. */
export function isProxiedPath(pathname: string): boolean {
  return PROXY_MATCHER.some((pattern) => new RegExp(`^${pattern}$`).test(pathname))
}
