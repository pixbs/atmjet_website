import Image from 'next/image'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/cn'
import type { ImageSource } from '@/lib/media'

/**
 * A document a visitor can download, as `/business_agents` offers them (issue #103,
 * `docs/legacy-inventory.md` section 6): a cover picture, the name of the document and a button
 * that opens the file in a new tab.
 *
 * The file itself is a prop. The legacy page chose between two hard-coded addresses per
 * document by comparing the locale (section 4, `/business_agents`); which file each locale gets
 * is content, and it moves into `SiteSettings` with E1.6.
 */

/** What the legacy asked the optimiser for; `h-56 w-full` is what decides the box on screen. */
const COVER = { width: 560, height: 320 }

export interface FileCardProps {
  title: string
  image: ImageSource
  /** The wording of the button and the address of the file it opens. */
  file: { label: string; href: string }
  className?: string
}

export function FileCard({ title, image, file, className }: FileCardProps) {
  return (
    <div className={cn('overflow-hidden rounded-2xl bg-graphite-950 md:min-w-80', className)}>
      {/* The alt text describes the picture; the legacy repeated the heading beside it. */}
      <Image
        alt={image.alt}
        className="h-56 w-full object-cover object-center"
        height={COVER.height}
        src={image.src}
        width={COVER.width}
      />
      <div className="gap-6 p-6">
        <h3>{title}</h3>
        {/* An address outside this site, so neither `Link` nor a locale: a plain anchor.
            `noopener` is what a browser already does for `target="_blank"`, written down. */}
        <a
          className={cn(buttonVariants({ as: 'link' }), 'self-start')}
          href={file.href}
          rel="noopener"
          target="_blank"
        >
          {file.label}
        </a>
      </div>
    </div>
  )
}
