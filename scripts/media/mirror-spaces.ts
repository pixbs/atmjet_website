/**
 * Mirrors the DigitalOcean Spaces objects the legacy rows point at into the S3 bucket, under
 * `legacy/`, and writes the manifest and the URL mapping the importers and the redirect map
 * read (issue #21, ADR-0002 item 9). The Space is read through its public addresses, so no
 * DigitalOcean credential is involved; the bucket is the one `src/lib/storage.ts` names.
 *
 * Idempotent and resumable: an object the bucket already holds at the recorded size is not
 * copied again, and a run can be repeated until the reconciliation reports nothing uncopied.
 *
 *   bun run scripts/media/mirror-spaces.ts [--schema legacy] [--dry-run] [--concurrency 8]
 *
 * Reads the `legacy` schema of the database `DATABASE_URL` names (the restore of #74).
 * Writes `docs/media/spaces-manifest.tsv`, `docs/media/spaces-mapping.json` and
 * `docs/media/spaces-missing.tsv`; a dry run writes the manifest and copies nothing.
 */
import { HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { sql } from '@payloadcms/db-postgres'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { getPayload } from 'payload'

import config from '../../src/payload.config'
import { readS3Settings } from '../../src/lib/storage'
import {
  distinctObjects,
  manifestTsv,
  mappingOf,
  objectKeyFor,
  reconcile,
  referencesQuery,
  type ManifestEntry,
  type SpacesReference,
} from './spaces'

const OUT_DIR = path.resolve('docs/media')

function flag(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`)

  return index === -1 ? undefined : (process.argv[index + 1] ?? '')
}

const schema = flag('schema') ?? 'legacy'
const dryRun = process.argv.includes('--dry-run')
const concurrency = Number(flag('concurrency') ?? 8)

const s3 = readS3Settings()
if (s3 === null) {
  console.error('mirror-spaces: the S3_* group is not set, so there is no bucket to mirror into')
  process.exit(1)
}
const publicUrl = s3.publicUrl ?? `https://${s3.bucket}.s3.${s3.region}.amazonaws.com`
const client = new S3Client({
  region: s3.region,
  credentials: { accessKeyId: s3.accessKeyId, secretAccessKey: s3.secretAccessKey },
  ...(s3.endpoint === undefined ? {} : { endpoint: s3.endpoint, forcePathStyle: true }),
})

async function references(): Promise<SpacesReference[]> {
  const payload = await getPayload({ config: await config })
  const drizzle = (
    payload.db as unknown as {
      drizzle: { execute(q: ReturnType<typeof sql.raw>): Promise<{ rows?: unknown[] }> }
    }
  ).drizzle
  const result = await drizzle.execute(sql.raw(referencesQuery(schema)))

  return (result.rows ?? []) as SpacesReference[]
}

/** What the Space says about an object, without fetching it. */
async function head(url: string): Promise<Pick<ManifestEntry, 'status' | 'size' | 'contentType'>> {
  try {
    const response = await fetch(url, { method: 'HEAD', redirect: 'follow' })
    const length = response.headers.get('content-length')

    return {
      status: response.status,
      size: length === null ? null : Number(length),
      contentType: response.headers.get('content-type'),
    }
  } catch {
    return { status: 0, size: null, contentType: null }
  }
}

/** Whether the bucket already holds the object at the size the Space reports. */
async function alreadyCopied(key: string, size: number | null): Promise<boolean> {
  try {
    const found = await client.send(new HeadObjectCommand({ Bucket: s3!.bucket, Key: key }))

    return size === null || found.ContentLength === size
  } catch {
    return false
  }
}

async function copy(entry: ManifestEntry): Promise<void> {
  const response = await fetch(entry.url)
  if (!response.ok) throw new Error(`${entry.url} answered ${response.status} to a GET`)

  await client.send(
    new PutObjectCommand({
      Bucket: s3!.bucket,
      Key: entry.key,
      Body: Buffer.from(await response.arrayBuffer()),
      ...(entry.contentType === null ? {} : { ContentType: entry.contentType }),
    }),
  )
}

/** Runs `work` over `items`, at most `limit` at a time, keeping the results in order. */
async function inParallel<T, R>(
  items: readonly T[],
  limit: number,
  work: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length)
  let next = 0

  await Promise.all(
    Array.from({ length: Math.max(1, limit) }, async () => {
      for (;;) {
        const index = next++
        if (index >= items.length) return
        results[index] = await work(items[index]!, index)
      }
    }),
  )

  return results
}

async function main(): Promise<void> {
  const objects = distinctObjects(await references())
  const urls = [...objects.keys()].sort()
  console.log(`mirror-spaces: ${urls.length} distinct objects referenced from schema "${schema}"`)

  const manifest = await inParallel(urls, concurrency, async (url, index) => {
    if (index % 500 === 0 && index > 0)
      console.log(`mirror-spaces: inspected ${index}/${urls.length}`)

    return { url, key: objectKeyFor(url), referencedBy: objects.get(url)!, ...(await head(url)) }
  })

  const copied = new Set<string>()
  if (!dryRun) {
    let done = 0
    await inParallel(
      manifest.filter((entry) => entry.status === 200),
      concurrency,
      async (entry) => {
        if (!(await alreadyCopied(entry.key, entry.size))) await copy(entry)
        copied.add(entry.key)
        done += 1
        if (done % 500 === 0) console.log(`mirror-spaces: copied ${done}`)
      },
    )
  }

  await mkdir(OUT_DIR, { recursive: true })
  await writeFile(path.join(OUT_DIR, 'spaces-manifest.tsv'), manifestTsv(manifest))
  await writeFile(
    path.join(OUT_DIR, 'spaces-missing.tsv'),
    manifestTsv(manifest.filter((entry) => entry.status !== 200)),
  )
  if (!dryRun)
    await writeFile(
      path.join(OUT_DIR, 'spaces-mapping.json'),
      JSON.stringify(mappingOf(manifest, publicUrl), null, 2) + '\n',
    )

  const report = reconcile(manifest, copied)
  console.log(
    `mirror-spaces: ${report.listed} listed, ${report.answering} answering, ${report.missing} missing, ${report.copied} copied${dryRun ? ' (dry run)' : ''}`,
  )
  if (!dryRun && report.uncopied.length > 0) {
    console.error(
      `mirror-spaces: ${report.uncopied.length} objects are not in the bucket; run again`,
    )
    process.exit(1)
  }
  process.exit(0)
}

void main()
