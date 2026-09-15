import Image from 'next/image'
import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'
import type { ImageSource } from '@/lib/media'

/**
 * The shell every full-screen hero is drawn in (issues #111, #113 and #114,
 * `docs/legacy-inventory.md` section 5): something filling the screen, the darkening gradient
 * over it, and the words over that.
 *
 * The legacy wrote it out once per section, down to the z-indexes; what differs between them is
 * where the words sit in the screen and whether the screen holds a photograph or a video.
 */

/** What the legacy asked the optimiser for; the photograph covers the screen whatever it is. */
const PHOTO = { width: 1920, height: 1080 }

/** The screen-filling photograph, for the two heroes drawn on one rather than on a video. */
export function HeroPhoto({ image, alt }: { image: ImageSource; alt: string }) {
  // The first screen of the page, so it is fetched with the markup rather than lazily: the
  // legacy marked every hero `loading='lazy'` (section 13, entry 15).
  return (
    <Image
      alt={alt}
      className="absolute inset-0 z-0 size-full object-cover"
      height={PHOTO.height}
      priority
      sizes="100vw"
      src={image.src}
      width={PHOTO.width}
    />
  )
}

export function HeroFrame({
  backdrop,
  section,
  contentClassName,
  children,
}: {
  /** What fills the screen behind the words: a photograph, or the video of the home page. */
  backdrop: ReactNode
  /** The `data-section` this hero answers to. */
  section: string
  contentClassName?: string
  children: ReactNode
}) {
  return (
    <section data-section={section}>
      {/* `.container` is an unlayered parity rule, so cancelling its margin needs the important
          marker, exactly as the legacy `!my-0` did (docs/adr/0006-styling-and-motion.md). */}
      <div className={cn('z-20 container my-0! h-svh gap-2', contentClassName)}>{children}</div>
      <div className="hero-darkening absolute inset-0 z-10" />
      {backdrop}
    </section>
  )
}
