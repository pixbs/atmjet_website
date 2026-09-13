/**
 * Redirect matching (issue #69).
 *
 * The legacy `next.config.mjs` shipped five permanent redirects, all locale-prefixed
 * (`docs/legacy-inventory.md` section 1.3):
 *
 *   /:locale/jets          → /
 *   /:locale/planes        → /:locale/aircraft
 *   /:locale/planes/:id    → /:locale/aircraft/:id
 *   /:locale/aircrafts     → /:locale/aircraft
 *   /:locale/aircrafts/:id → /:locale/aircraft/:id
 *
 * Two of them carry a dynamic segment through to the target, which is why a rule can match the
 * paths below itself and hand the remainder over: `/planes/g650` and `/planes/anything/at/all`
 * both land on `/aircraft/…` without anybody writing a pattern language.
 *
 * Paths here never carry the locale. The resolver strips it before matching and puts it back on
 * a target that is relative, so one rule covers every language the site is published in — which
 * is exactly what `/:locale/` meant in the legacy config.
 */

/** What a stored redirect looks like once it is read back, in the shape matching needs. */
export interface RedirectRule {
  /** The path this rule catches, without the locale prefix. */
  from: string
  /** Where it sends the visitor: a path (locale-relative) or an absolute URL. */
  to: string
  /** Whether the paths below `from` are caught too, with the remainder carried to the target. */
  matchSubPaths?: boolean | null
  /** The locale this rule applies to, or nothing for every locale. */
  locale?: string | null
  /** The HTTP status the redirect is served with. */
  type?: string | null
}

export interface RedirectMatch {
  destination: string
  status: number
}

/** The status a rule uses when it does not say, matching the legacy `permanent: true`. */
export const DEFAULT_REDIRECT_STATUS = 308

/**
 * A path in the one spelling everything here compares: a leading slash, no trailing one, and no
 * query or fragment. The locale root is `/`, not the empty string, so it can never match a rule
 * by accident of both being falsy.
 */
export function normaliseRedirectPath(value: unknown): string {
  if (typeof value !== 'string') return '/'

  const withoutQuery = value.split(/[?#]/)[0].trim()
  if (withoutQuery === '') return '/'

  const withLeadingSlash = withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`
  const trimmed = withLeadingSlash.replace(/\/+$/, '')

  return trimmed === '' ? '/' : trimmed
}

/** Whether a target is somewhere else entirely, in which case the locale is none of our business. */
function isAbsolute(destination: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(destination) || destination.startsWith('//')
}

function statusOf(rule: RedirectRule): number {
  const parsed = Number.parseInt(String(rule.type ?? ''), 10)

  return Number.isFinite(parsed) ? parsed : DEFAULT_REDIRECT_STATUS
}

/**
 * Where a request should be sent, if anywhere.
 *
 * Rules are considered in order and the first match wins, so a rule written for one exact path
 * beats a broader one above it only if it is listed first: the loader sorts the longest `from`
 * to the front for exactly that reason. A rule scoped to a locale is skipped for every other.
 */
export function matchRedirect(
  rules: readonly RedirectRule[],
  pathname: string,
  locale: string,
): RedirectMatch | undefined {
  const path = normaliseRedirectPath(pathname)

  for (const rule of rules) {
    if (rule.locale && rule.locale !== locale) continue

    const from = normaliseRedirectPath(rule.from)
    const remainder =
      path === from ? '' : path.startsWith(`${from}/`) ? path.slice(from.length) : undefined

    if (remainder === undefined) continue
    if (remainder !== '' && !rule.matchSubPaths) continue

    const target = typeof rule.to === 'string' ? rule.to.trim() : ''
    if (target === '') continue

    if (isAbsolute(target)) {
      return { destination: `${target.replace(/\/+$/, '')}${remainder}`, status: statusOf(rule) }
    }

    const to = normaliseRedirectPath(target)
    const localised = to === '/' ? `/${locale}` : `/${locale}${to}`

    return { destination: `${localised}${remainder}`, status: statusOf(rule) }
  }

  return undefined
}

/**
 * The order `matchRedirect` wants: the most specific path first, so `/planes/legacy` is not
 * swallowed by a sub-path rule on `/planes` that happens to have been created earlier.
 */
export function bySpecificity(a: RedirectRule, b: RedirectRule): number {
  const fromA = normaliseRedirectPath(a.from)
  const fromB = normaliseRedirectPath(b.from)

  if (fromA.length !== fromB.length) return fromB.length - fromA.length

  return fromA.localeCompare(fromB)
}
