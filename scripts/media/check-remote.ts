/**
 * What the old bucket answers for the pictures and documents the legacy rows still point at
 * there (issue #84, phase 1): `aircraft_images.url`, `aircrafts.pdf_attachment` and the
 * `new_yachts.photos` the Space does not hold. Nothing is copied: that bucket is this account's
 * own, and the Space's objects are the mirror's business (#21, `mirror-spaces.ts`).
 *
 *   bun run scripts/media/check-remote.ts [--schema legacy] [--concurrency 12]
 *
 * Reads the `legacy` schema of the database `DATABASE_URL` names (#74). Writes
 * `docs/media/remote-manifest.tsv` and `docs/media/remote-missing.tsv` in the shape of the
 * Space's manifest, with the object's path on its bucket in the key column.
 */
import { sql } from '@payloadcms/db-postgres'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { getPayload } from 'payload'

import config from '../../src/payload.config'
import { SPACES_HOSTS } from '../../src/lib/media'
import { manifestTsv, type ManifestEntry, type SpacesReference } from './spaces'

const OUT_DIR = path.resolve('docs/media')

function flag(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`)

  return index === -1 ? undefined : (process.argv[index + 1] ?? '')
}

const schema = flag('schema') ?? 'legacy'
const concurrency = Number(flag('concurrency') ?? 12)

/** The columns that name an object by address and are not the Space's (`mirror-spaces.ts`). */
export function remoteReferencesQuery(schema: string): string {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(schema))
    throw new Error(`check-remote: ${JSON.stringify(schema)} is not a schema name`)

  const from = (table: string) => `"${schema}"."${table}"`

  return [
    `SELECT 'aircraft_images' AS "table", id::text AS "rowId", 'url' AS "column", url AS value FROM ${from('aircraft_images')}`,
    `SELECT 'aircrafts', id::text, 'pdf_attachment', pdf_attachment FROM ${from('aircrafts')}`,
    `SELECT 'new_yachts', id::text, 'photos', unnest(photos) FROM ${from('new_yachts')}`,
  ].join('\nUNION ALL\n')
}

/** The address of a value that names an object somewhere other than the Space, or `null`. */
export function remoteUrl(value: string | null | undefined): string | null {
  const trimmed = (value ?? '').trim()
  if (!/^https?:\/\//i.test(trimmed)) return null

  try {
    const url = new URL(trimmed)
    if ((SPACES_HOSTS as readonly string[]).includes(url.hostname.toLowerCase())) return null

    return `${url.protocol}//${url.hostname.toLowerCase()}${url.pathname}`
  } catch {
    return null
  }
}

async function head(url: string): Promise<Pick<ManifestEntry, 'status' | 'size' | 'contentType'>> {
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        signal: AbortSignal.timeout(30_000),
      })
      const length = response.headers.get('content-length')

      return {
        status: response.status,
        size: length === null ? null : Number(length),
        contentType: response.headers.get('content-type'),
      }
    } catch (error) {
      if (attempt === 3) {
        console.error(`check-remote: ${url}: ${(error as Error).message}`)
        return { status: 0, size: null, contentType: null }
      }
      await new Promise((resolve) => setTimeout(resolve, 5_000 * attempt))
    }
  }
}

async function main(): Promise<void> {
  const payload = await getPayload({ config: await config })
  const drizzle = (
    payload.db as unknown as {
      drizzle: { execute(q: ReturnType<typeof sql.raw>): Promise<{ rows?: unknown[] }> }
    }
  ).drizzle
  const result = await drizzle.execute(sql.raw(remoteReferencesQuery(schema)))
  const objects = new Map<string, string[]>()
  for (const reference of (result.rows ?? []) as SpacesReference[]) {
    const url = remoteUrl(reference.value)
    if (url === null) continue
    const owners = objects.get(url) ?? []
    owners.push(`${reference.table}:${reference.rowId}.${reference.column}`)
    objects.set(url, owners)
  }
  const urls = [...objects.keys()].sort()
  console.log(
    `check-remote: ${urls.length} distinct objects off the Space referenced from "${schema}"`,
  )

  const manifest = new Array<ManifestEntry>(urls.length)
  let next = 0
  await Promise.all(
    Array.from({ length: Math.max(1, concurrency) }, async () => {
      for (;;) {
        const index = next++
        if (index >= urls.length) return
        const url = urls[index]!
        if (index % 2000 === 0 && index > 0)
          console.log(`check-remote: inspected ${index}/${urls.length}`)
        manifest[index] = {
          url,
          key: decodeURIComponent(new URL(url).pathname).slice(1),
          referencedBy: objects.get(url)!,
          ...(await head(url)),
        }
      }
    }),
  )

  await mkdir(OUT_DIR, { recursive: true })
  await writeFile(path.join(OUT_DIR, 'remote-manifest.tsv'), manifestTsv(manifest))
  await writeFile(
    path.join(OUT_DIR, 'remote-missing.tsv'),
    manifestTsv(manifest.filter((entry) => entry.status !== 200)),
  )
  const answering = manifest.filter((entry) => entry.status === 200).length
  console.log(
    `check-remote: ${manifest.length} listed, ${answering} answering, ${manifest.length - answering} missing`,
  )
  process.exit(0)
}

void main()
