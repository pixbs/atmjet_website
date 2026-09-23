/**
 * The DigitalOcean Spaces objects the legacy data still points at (issue #21, ADR-0002 item 9):
 * what counts as one, the key it is mirrored under, and whether a run copied everything the
 * manifest lists. Pure, so `tests/unit/spaces.test.ts` pins it away from a bucket.
 */

/** The two spellings the legacy rows use for the one Space: with the CDN in front and without. */
export const SPACES_HOSTS = [
  'atmjet.ams3.digitaloceanspaces.com',
  'atmjet.ams3.cdn.digitaloceanspaces.com',
] as const

/** Where every mirrored object goes in the bucket, so it never collides with an upload. */
export const LEGACY_PREFIX = 'legacy'

/**
 * The four documents the business-agents page linked by URL rather than through a table
 * (`docs/legacy-inventory.md` section 9.4; the double space in the checklist name is theirs).
 */
export const LEGACY_PDFS = [
  'https://atmjet.ams3.cdn.digitaloceanspaces.com/Checklist%20for%20ordering%20%20a%20private%20jet%20for%20an%20executive%20EN.pdf',
  'https://atmjet.ams3.cdn.digitaloceanspaces.com/Checklist%20for%20ordering%20%20a%20private%20jet%20for%20an%20executive%20RU.pdf',
  'https://atmjet.ams3.cdn.digitaloceanspaces.com/presentation/ATM%20JET%20Presentation.pdf',
  'https://atmjet.ams3.cdn.digitaloceanspaces.com/presentation/ATM%20JET%20Presentation%20RU.pdf',
] as const

/** A column value that names an object, with the row it came from. */
export interface SpacesReference {
  table: string
  rowId: string
  column: string
  value: string
}

/**
 * The absolute `https://` address of a legacy value, or `null` when it does not point at the
 * Space. `vehicles.image` and `vehicles.thumb` hold the host with no scheme
 * (`docs/legacy-inventory.md` section 8), the yacht arrays hold full URLs, and the same object
 * can be written with the CDN host or without: both are the same key in the Space.
 */
export function normaliseSpacesUrl(value: string | null | undefined): string | null {
  const trimmed = (value ?? '').trim()
  if (trimmed === '') return null

  const absolute = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`

  try {
    const url = new URL(absolute)
    if (!(SPACES_HOSTS as readonly string[]).includes(url.hostname.toLowerCase())) return null
    // One address per object, whatever the row wrote: https, no query, no fragment.
    return `https://${url.hostname.toLowerCase()}${url.pathname}`
  } catch {
    return null
  }
}

/**
 * The key an object is mirrored under: its decoded path in the Space, below `legacy/`, so
 * `…/Duke_yacht/Duke_01.jpg` becomes `legacy/Duke_yacht/Duke_01.jpg` whichever host named it.
 */
export function objectKeyFor(spacesUrl: string): string {
  const path = new URL(spacesUrl).pathname

  return `${LEGACY_PREFIX}${decodeURIComponent(path)}`
}

/** The address the importers and the redirect map write for a mirrored object. */
export function mirroredUrl(publicUrl: string, key: string): string {
  return `${publicUrl.replace(/\/+$/, '')}/${key.split('/').map(encodeURIComponent).join('/')}`
}

/** What one line of the manifest records about an object. */
export interface ManifestEntry {
  url: string
  key: string
  /** What the Space answered to a HEAD: 200 for an object, anything else for a problem. */
  status: number
  size: number | null
  contentType: string | null
  /** The rows that point at it, as `table:id.column`, so a missing object names its owners. */
  referencedBy: string[]
}

/**
 * The distinct objects a set of references points at, each with the rows that name it. A row
 * that names the same object twice, or two rows that name it, count once: the Space holds one
 * object and the bucket will hold one copy.
 */
export function distinctObjects(references: readonly SpacesReference[]): Map<string, string[]> {
  const objects = new Map<string, string[]>()

  for (const reference of references) {
    const url = normaliseSpacesUrl(reference.value)
    if (url === null) continue

    const owners = objects.get(url) ?? []
    owners.push(`${reference.table}:${reference.rowId}.${reference.column}`)
    objects.set(url, owners)
  }

  for (const pdf of LEGACY_PDFS) {
    const url = normaliseSpacesUrl(pdf)
    if (url !== null && !objects.has(url)) objects.set(url, ['business_agents:page.pdf'])
  }

  return objects
}

/** What a run says about itself, and what the acceptance criteria of #21 read. */
export interface Reconciliation {
  listed: number
  answering: number
  missing: number
  copied: number
  /** Objects the Space answered for that the bucket does not hold: a run to repeat. */
  uncopied: string[]
}

/**
 * Whether the bucket holds every object the Space answered for. `missing` objects are listed,
 * never skipped in silence: a legacy row that points at nothing is a fact the importers need.
 */
export function reconcile(
  manifest: readonly ManifestEntry[],
  copiedKeys: ReadonlySet<string>,
): Reconciliation {
  const answering = manifest.filter((entry) => entry.status === 200)
  const uncopied = answering.filter((entry) => !copiedKeys.has(entry.key)).map((entry) => entry.key)

  return {
    listed: manifest.length,
    answering: answering.length,
    missing: manifest.length - answering.length,
    copied: answering.length - uncopied.length,
    uncopied,
  }
}

const TSV_HEADER = ['url', 'status', 'size', 'content_type', 'key', 'referenced_by']

/** The manifest as a table a reviewer can diff, one object per line, sorted by address. */
export function manifestTsv(manifest: readonly ManifestEntry[]): string {
  const lines = [...manifest]
    .sort((a, b) => a.url.localeCompare(b.url))
    .map((entry) =>
      [
        entry.url,
        String(entry.status),
        entry.size === null ? '' : String(entry.size),
        entry.contentType ?? '',
        entry.key,
        entry.referencedBy.join(' '),
      ].join('\t'),
    )

  return [TSV_HEADER.join('\t'), ...lines].join('\n') + '\n'
}

/** The legacy address of every object the Space answered for, mapped to where it now lives. */
export function mappingOf(
  manifest: readonly ManifestEntry[],
  publicUrl: string,
): Record<string, string> {
  const mapping: Record<string, string> = {}

  for (const entry of [...manifest].sort((a, b) => a.url.localeCompare(b.url)))
    if (entry.status === 200) mapping[entry.url] = mirroredUrl(publicUrl, entry.key)

  return mapping
}

/**
 * The legacy columns that hold these addresses (`docs/legacy-inventory.md` sections 8 and 9.4),
 * read from the frozen `legacy` schema of the new project (ADR-0002, #74). The schema name comes
 * from a flag rather than data, and only a plain name is accepted into the statement.
 */
export function referencesQuery(schema: string): string {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(schema))
    throw new Error(`mirror-spaces: ${JSON.stringify(schema)} is not a schema name`)

  const from = (table: string) => `"${schema}"."${table}"`

  return [
    `SELECT 'vehicles' AS "table", id::text AS row_id, 'image' AS "column", image AS value FROM ${from('vehicles')}`,
    `SELECT 'vehicles', id::text, 'thumb', thumb FROM ${from('vehicles')}`,
    `SELECT 'yachts', id::text, 'pictures', unnest(pictures) FROM ${from('yachts')}`,
    `SELECT 'new_yachts', id::text, 'photos', unnest(photos) FROM ${from('new_yachts')}`,
  ].join('\nUNION ALL\n')
}
