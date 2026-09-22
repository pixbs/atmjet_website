/**
 * Where uploads are kept (issue #20, `docs/environment.md`). Payload's own disk storage is what
 * local development and every test run use; a deployment that carries the `S3_*` group puts
 * them in the bucket instead.
 *
 * Half the group is worse than none of it — one misspelled name would otherwise leave the
 * uploads on a disk the next deployment throws away — so an incomplete group is an error that
 * says which part is missing, as `readEnvironment` does for the two variables the site cannot
 * start without.
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

const OPTIONAL = ['S3_ENDPOINT', 'S3_PUBLIC_URL'] as const

/** `null` when the environment names no bucket at all, which is what keeps uploads on disk. */
export function readS3Settings(
  source: Record<string, string | undefined> = process.env,
): S3Settings | null {
  const read = (name: string): string => (source[name] ?? '').trim()

  if ([...REQUIRED, ...OPTIONAL].every((name) => read(name) === '')) return null

  const missing = REQUIRED.filter((name) => read(name) === '')

  if (missing.length > 0)
    throw new Error(
      [
        'The media bucket is half configured:',
        ...missing.map((name) => `  - ${name} is not set`),
        `Set them, or none of ${REQUIRED.join(', ')}, which keeps uploads on disk.`,
        'What each variable is for, and which environments hold it: docs/environment.md.',
      ].join('\n'),
    )

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
