/**
 * Where uploads are kept (issue #20, `docs/environment.md`). Payload's own disk storage is what
 * local development and every test run use; a deployment that carries the `S3_*` group puts
 * them in the bucket instead.
 *
 * Half the group is worse than none of it: one misspelled name would otherwise leave the uploads
 * on a disk the next deployment throws away, and nothing would say so. It is reported rather
 * than thrown, because only `DATABASE_URL` and `PAYLOAD_SECRET` are worth refusing to start over
 * (`src/lib/env.ts`), and a site that will not render is a worse answer to a misspelling than a
 * site whose editor cannot upload — the same call `src/lib/urls.ts` makes about a bare host.
 */

export interface S3Settings {
  bucket: string
  region: string
  accessKeyId: string
  secretAccessKey: string
  /** For an S3-compatible host; AWS builds its own from the region. */
  endpoint?: string
  /** What a browser is given. Without it the plugin addresses the bucket directly. */
  publicUrl?: string
}

/** Without all four there is no bucket to speak of. */
const REQUIRED = ['S3_BUCKET', 'S3_REGION', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY'] as const

/** `null` when the environment names no bucket, or names one it has not finished naming. */
export function readS3Settings(
  source: Record<string, string | undefined> = process.env,
): S3Settings | null {
  const read = (name: string): string => (source[name] ?? '').trim()
  const missing = REQUIRED.filter((name) => read(name) === '')

  // None of the four: this deployment wants its disk, whatever the other two say. An endpoint
  // or a public URL on its own names no bucket, so neither is evidence of a half-written group.
  if (missing.length === REQUIRED.length) return null

  if (missing.length > 0) {
    console.warn(
      `[media] the bucket is half configured, so the uploads stay on disk: ${missing.join(', ')} ` +
        `${missing.length === 1 ? 'is' : 'are'} not set. docs/environment.md says what each one is for.`,
    )

    return null
  }

  const endpoint = read('S3_ENDPOINT')
  const publicUrl = read('S3_PUBLIC_URL')

  return {
    bucket: read('S3_BUCKET'),
    region: read('S3_REGION'),
    accessKeyId: read('S3_ACCESS_KEY_ID'),
    secretAccessKey: read('S3_SECRET_ACCESS_KEY'),
    ...(endpoint === '' ? {} : { endpoint }),
    ...(publicUrl === '' ? {} : { publicUrl: publicUrl.replace(/\/+$/, '') }),
  }
}

/** The key every media object is written under, so the bucket says what a file belongs to. */
export const MEDIA_PREFIX = 'media'

/**
 * The address a browser is given for an object, where the environment names one. The plugin
 * addresses the bucket itself otherwise, which is right until a CDN stands in front of it.
 */
export function mediaFileUrl(publicUrl: string, filename: string, prefix?: string): string {
  return [publicUrl, prefix, filename].filter((part) => part !== undefined && part !== '').join('/')
}
