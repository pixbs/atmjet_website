import type { Payload } from 'payload'

import { tableRows } from './source'

/**
 * Every URL the legacy site published, asked of the new one (issue #85,
 * `docs/adr/0002-database-migration-strategy.md` item 10): each must end on a page that answers
 * 200 on the same host, directly or through the redirects of #172 and the locale middleware.
 *
 * The legacy site published three kinds (`docs/legacy-inventory.md` sections 2.3 and 4): the
 * static sitemap, unprefixed, with an `en` and a `ru` alternate each; `/aircraft/<tail number>`
 * for every plane row of `vehicles`, from the aircraft sitemap; and the detail pages its own
 * cards linked to, `/aircraft/<catalogue slug>` and `/yachts/<charter slug>`.
 */
const STATIC_PATHS = [
  '/',
  '/aircraft',
  '/atm_jet_group',
  '/business_agents',
  '/cargo_charter',
  // `/citezens` is left out: the legacy sitemap misspelled it, and it was a 404 there too.
  '/empty_legs',
  '/group_charters',
  '/medical_aviation',
  '/partners',
  '/sales_dept',
  '/yachts',
]

const LOCALES = ['en', 'ru']

export interface LegacyReferences {
  tailNumbers: string[]
  catalogueSlugs: string[]
  charterSlugs: string[]
}

/** The paths, each with the prefixes the legacy site served it under. */
export function legacyPaths({
  tailNumbers,
  catalogueSlugs,
  charterSlugs,
}: LegacyReferences): string[] {
  const prefixed = (path: string) => [
    path,
    ...LOCALES.map((locale) => (path === '/' ? `/${locale}` : `/${locale}${path}`)),
  ]
  const segment = (value: string) => encodeURIComponent(value.trim())
  const named = (values: string[]) => values.filter((value) => value.trim() !== '')

  return [
    ...new Set([
      ...STATIC_PATHS.flatMap(prefixed),
      ...named(tailNumbers).flatMap((tail) => prefixed(`/aircraft/${segment(tail)}`)),
      ...named(catalogueSlugs).map((slug) => `/en/aircraft/${segment(slug)}`),
      ...named(charterSlugs).map((slug) => `/en/yachts/${segment(slug)}`),
    ]),
  ]
}

export interface Answer {
  path: string
  status: number
  /** Where the redirects ended, when they ended somewhere else. */
  location?: string
}

type Fetch = (url: string, init: RequestInit) => Promise<Response>

/** Follows the redirects itself, so one that leaves the host is reported rather than followed. */
async function answer(
  base: URL,
  path: string,
  headers: HeadersInit,
  fetcher: Fetch,
): Promise<Answer> {
  let url = new URL(path, base)

  for (let hop = 0; hop < 5; hop += 1) {
    const response = await fetcher(url.toString(), { redirect: 'manual', headers })
    const location = response.headers.get('location')

    if (response.status < 300 || response.status >= 400 || location === null)
      return {
        path,
        status: response.status,
        location: url.pathname === path ? undefined : url.pathname,
      }

    url = new URL(location, url)
    if (url.host !== base.host) return { path, status: response.status, location: url.toString() }
  }

  return { path, status: 310, location: url.pathname }
}

/** The paths that do not end on a page of this site answering 200. */
export async function unanswered(
  baseUrl: string,
  paths: string[],
  options: { bypass?: string; concurrency?: number; fetcher?: Fetch } = {},
): Promise<Answer[]> {
  const { bypass, concurrency = 8, fetcher = fetch } = options
  const base = new URL(baseUrl)
  // A protected preview answers its login page otherwise (issue #248).
  const headers: HeadersInit = bypass ? { 'x-vercel-protection-bypass': bypass } : {}
  const queue = [...paths]
  const failed: Answer[] = []

  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      for (let path = queue.shift(); path !== undefined; path = queue.shift()) {
        const result = await answer(base, path, headers, fetcher)
        if (result.status !== 200) failed.push(result)
      }
    }),
  )

  return failed.sort((a, b) => a.path.localeCompare(b.path))
}

/** What the legacy schema published: its plane tail numbers, catalogue slugs and charter slugs. */
export async function legacyReferences(
  payload: Payload,
  schema = 'legacy',
): Promise<LegacyReferences> {
  const column = async <Row>(table: string, pick: (row: Row) => string | null) => {
    const values: string[] = []
    for await (const row of tableRows<Row>(payload, { schema, table, orderBy: 'id' }).rows())
      values.push(pick(row) ?? '')
    return values
  }

  return {
    tailNumbers: await column<{ tail_number: string | null }>('vehicles', (row) => row.tail_number),
    catalogueSlugs: await column<{ slug: string }>('aircrafts', (row) => row.slug),
    charterSlugs: await column<{ slug: string | null }>('new_yachts', (row) => row.slug),
  }
}
