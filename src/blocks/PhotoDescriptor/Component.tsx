import Image from 'next/image'

import type { ImageSource } from '@/lib/media'

/**
 * The descriptor with a photograph (issue #133, `docs/legacy-inventory.md` section 4): the
 * heading and sentence centred in a narrow column, the picture across the page under them.
 */

/** What the legacy asked the optimiser for; the picture is drawn at the page's own width. */
const PHOTO = { width: 1080, height: 1920 }

export interface PhotoDescriptorProps {
  title: string
  description: string
  image: ImageSource
}

export function PhotoDescriptor({ title, description, image }: PhotoDescriptorProps) {
  return (
    <section data-section="photo-descriptor">
      <div className="container">
        <h2 className="mx-auto max-w-xl text-center">{title}</h2>
        <p className="mx-auto max-w-xl py-4 text-center">{description}</p>
        <Image
          alt={image.alt === '' ? title : image.alt}
          className="my-10 w-full rounded-xl object-cover object-center"
          height={PHOTO.height}
          sizes="(min-width: 1280px) 1280px, 100vw"
          src={image.src}
          width={PHOTO.width}
        />
      </div>
    </section>
  )
}
