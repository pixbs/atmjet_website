'use client'

import Image from 'next/image'
import { useState } from 'react'

import { cn } from '@/lib/cn'
import { imageIndex, type ImageSource } from '@/lib/media'

/**
 * The photo gallery of the aircraft and yacht detail pages (issue #101,
 * `docs/legacy-inventory.md` section 6): one large image with a strip of thumbnails under it
 * that snaps as it scrolls, and the chosen thumbnail brought into the middle of the strip.
 *
 * Two things the legacy could not do, neither of them visible:
 *
 * - A thumbnail is a button. The legacy hung `onClick` on a `<div>`, so the gallery could not be
 *   reached or operated with a keyboard at all — the same fix the accordion needed (issue #106).
 * - It cannot be opened past its last photo. `selected={1}` on a yacht with one photo rendered
 *   `<Image src={undefined}>` and crashed the page (section 13, entry 45).
 *
 * The dimming follows the chosen thumbnail. The legacy compared each index against the `selected`
 * prop rather than the state it kept, so the highlight stayed wherever the page had opened and
 * never moved again; on the first frame the two agree, which is why it looks right in a capture.
 */

/** The large image. `rounded-3xl` is the legacy radius; its `border-gray-400` set a colour with
 * no width, so it drew nothing and is not ported (`docs/legacy-inventory.md` section 13, 17). */
const FULL = 'rounded-3xl'

/**
 * A thumbnail. The legacy drew these on a `div`, so the three declarations that make a button
 * look like a button are taken back off: `rounded-none` because its `rounded-lg` pointed at a
 * variable that was never defined and rendered square, and the background and padding because a
 * photo fills the box.
 */
const THUMB = 'aspect-video h-16 w-24 shrink-0 overflow-hidden rounded-none bg-transparent p-0'

/**
 * The dim on the thumbnails that are not showing. The hover half pins each one where it is: the
 * global `button:hover` fade would otherwise brighten a dimmed thumbnail and dim the chosen one,
 * and a `div` had no hover state to fade.
 */
const shownness = (isCurrent: boolean) =>
  isCurrent ? 'opacity-100 hover:opacity-100' : 'opacity-50 hover:opacity-50'

export function Gallery({
  images,
  selected = 0,
  className,
}: {
  images: readonly ImageSource[]
  /** The photo to open on. Out of range opens the nearest one that exists. */
  selected?: number
  className?: string
}) {
  const [index, setIndex] = useState(() => imageIndex(selected, images.length))
  const current = images[imageIndex(index, images.length)]

  if (!current) return null

  return (
    <div className={cn('gap-10', className)}>
      <Image alt={current.alt} className={FULL} height={600} src={current.src} width={600} />
      <div className="no-scrollbar snap-x snap-mandatory flex-row gap-2 overflow-x-scroll overflow-y-hidden">
        {images.map((image, position) => (
          <button
            key={`${image.src}-${position}`}
            aria-current={position === index}
            className={cn(THUMB, shownness(position === index))}
            onClick={(event) => {
              setIndex(position)
              // The legacy brought the chosen thumbnail to the middle of the strip without
              // moving the page around it.
              event.currentTarget.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center',
              })
            }}
            type="button"
          >
            <Image alt={image.alt} height={100} src={image.src} width={100} />
          </button>
        ))}
      </div>
    </div>
  )
}
