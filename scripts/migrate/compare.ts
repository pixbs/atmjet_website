import type { Payload } from 'payload'

import { legacyReferences, type LegacyReferences } from './urls'

/**
 * The sampled deep comparison ADR-0002 item 10 promises (issue #85): what a visitor reads on a
 * page of the legacy site against the same page of a deployment of this one, for a sample of
 * the aircraft and the yachts the legacy published. Text is compared, not markup: the heading,
 * and the figures of the key-stats card, which both sites draw as `<h3>value</h3>` followed by
 * `<p>label</p>` (`docs/legacy-inventory.md` section 4, `KeyStatsCard`).
 *
 *   bun run import:legacy compare --base-url <deployment> [--legacy-url https://atmjet.com] [--sample 30]
 */

/** What a page says, as text: its heading and its figures by label. */
export interface Rendered {
  heading: string | null
  figures: Record<string, string>
}

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
}

/** The text of a fragment of markup: tags gone, entities decoded, whitespace folded. */
export function text(markup: string): string {
  return markup
    .replace(/<[^>]+>/g, '')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, code: string) => {
      if (code.startsWith('#x') || code.startsWith('#X'))
        return String.fromCodePoint(parseInt(code.slice(2), 16))
      if (code.startsWith('#')) return String.fromCodePoint(Number(code.slice(1)))

      return ENTITIES[code.toLowerCase()] ?? entity
    })
    .replace(/\s+/g, ' ')
    .trim()
}

export function rendered(html: string): Rendered {
  const heading = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)
  const figures: Record<string, string> = {}
  for (const match of html.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/g)) {
    const label = text(match[2] ?? '')
    // The first figure under a label is the card's; a second is another section's.
    if (label !== '' && !(label in figures)) figures[label] = text(match[1] ?? '')
  }

  return { heading: heading ? text(heading[1] ?? '') : null, figures }
}

/** What the port says differently from the legacy, one line each; nothing when it says the same. */
export function differences(legacy: Rendered, port: Rendered): string[] {
  const found: string[] = []
  if (legacy.heading !== port.heading)
    found.push(`heading: ${JSON.stringify(legacy.heading)} → ${JSON.stringify(port.heading)}`)
  for (const [label, value] of Object.entries(legacy.figures)) {
    const ours = port.figures[label]
    if (ours === undefined) found.push(`${label}: ${JSON.stringify(value)} → missing`)
    else if (ours !== value)
      found.push(`${label}: ${JSON.stringify(value)} → ${JSON.stringify(ours)}`)
  }

  return found
}

/**
 * The paths of the sample: a third catalogue aircraft, a third planes of `vehicles`, a third
 * charter yachts, each spread over its list rather than taken from its start, in the English
 * the legacy wrote every detail URL in.
 */
export function sampled(references: LegacyReferences, size: number): string[] {
  const spread = (values: string[], count: number): string[] => {
    const named = values.map((value) => value.trim()).filter((value) => value !== '')
    if (named.length <= count) return named
    const step = named.length / count

    return Array.from({ length: count }, (_, index) => named[Math.floor(index * step)]!)
  }
  const each = Math.max(1, Math.ceil(size / 3))

  return [
    ...spread(references.catalogueSlugs, each).map(
      (slug) => `/en/aircraft/${encodeURIComponent(slug)}`,
    ),
    ...spread(references.tailNumbers, each).map(
      (tail) => `/en/aircraft/${encodeURIComponent(tail)}`,
    ),
    ...spread(references.charterSlugs, each).map(
      (slug) => `/en/yachts/${encodeURIComponent(slug)}`,
    ),
  ]
}

export interface Comparison {
  path: string
  /** What the legacy and the deployment answered. */
  status: [number, number]
  differences: string[]
}

export interface Page {
  status: number
  html: string
}

async function fetchPage(url: string): Promise<Page> {
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(60_000) })

      return { status: response.status, html: await response.text() }
    } catch (error) {
      if (attempt === 3) throw error
      await new Promise((resolve) => setTimeout(resolve, 5_000 * attempt))
    }
  }
}

export async function compareRendered(
  payload: Payload,
  options: {
    baseUrl: string
    legacyUrl?: string
    sample?: number
    schema?: string
    fetchPage?: (url: string) => Promise<Page>
  },
): Promise<Comparison[]> {
  const {
    baseUrl,
    legacyUrl = 'https://atmjet.com',
    sample = 30,
    schema = 'legacy',
    fetchPage: read = fetchPage,
  } = options
  const strip = (url: string) => url.replace(/\/+$/, '')
  const paths = sampled(await legacyReferences(payload, schema), sample)
  const results = new Array<Comparison>(paths.length)
  let next = 0

  await Promise.all(
    Array.from({ length: 4 }, async () => {
      for (;;) {
        const index = next++
        if (index >= paths.length) return
        const path = paths[index]!
        const [legacy, port] = await Promise.all([
          read(`${strip(legacyUrl)}${path}`),
          read(`${strip(baseUrl)}${path}`),
        ])
        results[index] = {
          path,
          status: [legacy.status, port.status],
          differences:
            legacy.status === 200 && port.status === 200
              ? differences(rendered(legacy.html), rendered(port.html))
              : legacy.status === port.status
                ? []
                : [`status: ${legacy.status} → ${port.status}`],
        }
      }
    }),
  )

  return results
}
