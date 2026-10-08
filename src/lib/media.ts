import { readS3Settings } from './storage'
import { siteOrigin } from './urls'

/**
 * Turning a Media document into something a component can draw (issue #101).
 *
 * Three rules live here because each is a decision rather than markup.
 *
 * Which address to use: the media migration imports the rows before it mirrors the files, so a
 * document can name a legacy host in `externalUrl` while its own upload does not exist yet, and
 * until it does that URL is the one that resolves (`src/collections/Media.ts`, E5.12).
 *
 * How to spell an upload of this site's own: Payload hands back an absolute URL built from
 * `serverURL`, and `next/image` refuses a host that is not in `remotePatterns` — which this
 * site's own host cannot be, because it differs per environment. The origin comes off so the
 * path matches the `localPatterns` entry `next.config.ts` already carries.
 *
 * Which image a gallery opens on: the legacy yacht page asked for the second one without
 * checking there was a second one, so a yacht with a single photo rendered
 * `<Image src={undefined}>` and took the page down with it (`docs/legacy-inventory.md` section
 * 13, entry 45).
 *
 * Where a legacy picture is fetched from (issue #84, ADR-0002 item 9): the rows keep the address
 * the legacy database held, which is the key the reconciliation compares, and the mirror of #21
 * holds every object of the Space under `legacy/<its path>` in the bucket, so the address a
 * browser is given is computed here rather than written into forty thousand rows.
 */

/** The two spellings the legacy rows use for the one Space: with the CDN in front and without. */
export const SPACES_HOSTS = [
  'atmjet.ams3.digitaloceanspaces.com',
  'atmjet.ams3.cdn.digitaloceanspaces.com',
] as const

/** Where every mirrored object lives in the bucket, so it never collides with an upload (#21). */
export const LEGACY_PREFIX = 'legacy'

/** The address a browser is given for the bucket, or `null` where the environment names none. */
export function legacyMirror(settings = readS3Settings()): string | null {
  if (settings === null) return null

  return settings.publicUrl ?? `https://${settings.bucket}.s3.${settings.region}.amazonaws.com`
}

let mirror: string | null | undefined
/** Read once: `readS3Settings` says its piece about a half-configured bucket every time. */
const currentMirror = (): string | null =>
  mirror === undefined ? (mirror = legacyMirror()) : mirror

/**
 * The address a legacy picture is fetched from: its mirrored copy when the row points at the
 * Space, the Space itself, spelt with the CDN host `next.config.ts` allows, where there is no
 * bucket to mirror into, and the row's own address everywhere else. `http://` becomes
 * `https://`, as the legacy card did (`docs/legacy-inventory.md` section 13, entry 35).
 */
export function legacyPictureAddress(url: string, mirror: string | null): string {
  const secure = url.replace(/^http:\/\//i, 'https://')
  let hostname: string
  let pathname: string
  try {
    ;({ hostname, pathname } = new URL(secure))
  } catch {
    return secure
  }
  if (!(SPACES_HOSTS as readonly string[]).includes(hostname.toLowerCase())) return secure
  if (mirror === null) return secure.replace(hostname, SPACES_HOSTS[1])

  return `${mirror}/${LEGACY_PREFIX}${pathname}`
}

/** The shape of a Media document, narrowed to what an image needs. */
export interface MediaLike {
  url?: string | null
  externalUrl?: string | null
  alt?: string | null
  width?: number | null
  height?: number | null
}

/** An image a component can render: an address and what it shows. */
export interface ImageSource {
  src: string
  alt: string
  width?: number
  height?: number
}

const text = (value: string | null | undefined): string => (value ?? '').trim()

/** An upload of this site's own, as the path `next/image` serves it from. */
function onThisSite(url: string, origin: string): string {
  if (!url.startsWith(`${origin}/`)) return url

  return url.slice(origin.length)
}

/**
 * `null` when the document names no file at all, so a caller leaves it out rather than drawing
 * a broken image.
 */
export function mediaSource(
  media: MediaLike | null | undefined,
  // Injected so the spelling of an upload can be tested without an environment behind it.
  origin: string = siteOrigin(),
  // Injected for the same reason: where the Space's objects are mirrored, or nowhere.
  mirror: string | null = currentMirror(),
): ImageSource | null {
  if (!media) return null

  const external = text(media.externalUrl)
  const src =
    external === '' ? onThisSite(text(media.url), origin) : legacyPictureAddress(external, mirror)
  if (src === '') return null

  return {
    src,
    alt: text(media.alt),
    ...(typeof media.width === 'number' ? { width: media.width } : {}),
    ...(typeof media.height === 'number' ? { height: media.height } : {}),
  }
}

/** One row of a photographs array: the upload, or the address the picture still lives at. */
export interface PictureRow {
  media?: number | string | MediaLike | null
  externalUrl?: string | null
  alt?: string | null
}

/**
 * A photograph as a component draws it: the row carries its own alt and may carry its own
 * address (E5.12), so what it says wins over the upload it points at.
 */
export function rowImageSource(
  row: PictureRow | null | undefined,
  origin?: string,
  mirror?: string | null,
): ImageSource | null {
  if (!row) return null

  const upload = typeof row.media === 'object' && row.media !== null ? row.media : {}
  const external = text(row.externalUrl)
  const alt = text(row.alt)

  return mediaSource(
    {
      ...upload,
      ...(external === '' ? {} : { externalUrl: external }),
      ...(alt === '' ? {} : { alt }),
    },
    origin,
    mirror,
  )
}

/** The image a gallery opens on: the one asked for, or the nearest one that exists. */
export function imageIndex(requested: number, count: number): number {
  if (count <= 0) return 0

  return Math.min(Math.max(0, Math.trunc(requested)), count - 1)
}
