import { HeroFrame } from '@/components/sections/hero-frame'
import type { ImageSource } from '@/lib/media'

/**
 * The home page hero (issue #111, `docs/legacy-inventory.md` section 5): a video filling the
 * screen behind a line of small capitals and the heading, silent and looping.
 *
 * The video says nothing the heading does not, so it is kept out of the reading of the page
 * rather than captioned: the legacy pointed its only `<track>` at a file that was never there
 * (section 13, entry 14), and dropping that element changes no pixel.
 *
 * No client code: a video that plays itself needs none, and the attributes below are what let
 * it play unasked — `muted` and `playsInline`, which is what iOS requires.
 */
export interface HeroVideoProps {
  overline: string
  title: string
  /** A path under `public/`, as the legacy served its videos (the decision on issue #111). */
  video: string
  /** Played instead on a narrow screen; the legacy defined one and never used it (entry 13). */
  videoMobile?: string
  /** The still held until the video plays; the legacy hero had none, so it opened on black. */
  poster?: ImageSource
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
          poster={poster?.src}
          preload="auto"
        >
          {videoMobile !== undefined && videoMobile !== '' && (
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
      {/* Hard-coded as the other two heroes carry it, until the copy moves to content (E10.4). */}
      <p className="absolute bottom-8 left-5 z-20 text-sm">©ATM JET</p>
    </HeroFrame>
  )
}
