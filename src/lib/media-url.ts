/**
 * Where to load an upload from (issue #62). Components never read `url` directly: a document may
 * still point at a legacy host through `externalUrl` during the media migration (E5.12), and the
 * generated sizes only exist for images that were large enough to need them.
 */

export interface MediaLike {
  url?: string | null
  externalUrl?: string | null
  sizes?: Partial<Record<string, { url?: string | null } | null>> | null
}

/**
 * The URL for one size, falling back to the original upload; `externalUrl` wins over both,
 * because a document that carries it has no file in this bucket yet.
 */
export function mediaUrl(media: MediaLike | null | undefined, size?: string): string | undefined {
  if (!media) return undefined
  if (media.externalUrl) return media.externalUrl

  const sized = size ? media.sizes?.[size]?.url : undefined

  return sized ?? media.url ?? undefined
}
