import { HeroFrame } from '@/components/sections/hero-frame'
import type { ImageSource } from '@/lib/media'

/**
 * The home page hero (issue #111, `docs/legacy-inventory.md` section 5): a film filling the
 * screen behind a line of small capitals and the heading, silent and looping.
 *
 * The film says nothing the heading does not, so it is kept out of the accessibility tree
 * rather than captioned: the legacy pointed its only `<track>` at a file that was never there
 * (section 13, entry 14) and that element is dropped, which changes no pixel.
 */
export interface HeroVideoProps {
  overline: string
  title: string
  /** A path under `public/`, as the legacy served its films (the decision on issue #111). */
  video: string
  /** Played instead on a narrow screen; the legacy defined one and never used it (entry 13). */
  videoMobile?: string
  poster: ImageSource
}

export function HeroVideo({ overline, title, video, videoMobile, poster }: HeroVideoProps) {
  return (
    <HeroFrame
      backdrop={
        <video
          aria-hidden
          autoPlay
          className="absolute inset-0 z-0 size-full object-cover"
          loop
          muted
          playsInline
          poster={poster.src}
          preload="auto"
        >
          {videoMobile !== undefined && (
            <source media="(max-width: 767px)" src={videoMobile} type="video/mp4" />
          )}
          <source src={video} type="video/mp4" />
        </video>
      }
      contentClassName="justify-center"
      section="hero-video"
    >
      <p className="text-center text-sm">{overline}</p>
      <h1 className="text-center">{title}</h1>
      <p className="absolute bottom-8 left-5 z-20 text-sm">©ATM JET</p>
    </HeroFrame>
  )
}
