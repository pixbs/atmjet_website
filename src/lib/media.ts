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
 */

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
): ImageSource | null {
  if (!media) return null

  const external = text(media.externalUrl)
  const src = external === '' ? onThisSite(text(media.url), origin) : external
  if (src === '') return null

  return {
    src,
    alt: text(media.alt),
    ...(typeof media.width === 'number' ? { width: media.width } : {}),
    ...(typeof media.height === 'number' ? { height: media.height } : {}),
  }
}

/** The image a gallery opens on: the one asked for, or the nearest one that exists. */
export function imageIndex(requested: number, count: number): number {
  if (count <= 0) return 0

  return Math.min(Math.max(0, Math.trunc(requested)), count - 1)
}
