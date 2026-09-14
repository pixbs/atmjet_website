import { mediaSource } from '@/lib/media'
import type { Page } from '@/payload-types'

import { HeroSubpage } from './HeroSubpage/Component'

/**
 * The sections of a page, in the order an editor put them (issue #112, E7). One case per block
 * type; a block whose image is missing draws nothing rather than a broken one.
 *
 * The page reads its layout at `depth: 1`, so an upload arrives as the document rather than as
 * its id.
 */
type LayoutBlock = NonNullable<Page['layout']>[number]

function blockFor(block: LayoutBlock, key: string) {
  switch (block.blockType) {
    case 'heroSubpage': {
      const image = mediaSource(typeof block.image === 'object' ? block.image : null)

      return image === null ? null : (
        <HeroSubpage
          key={key}
          description={block.description ?? undefined}
          image={image}
          title={block.title}
        />
      )
    }
  }
}

export function RenderBlocks({ layout }: { layout: Page['layout'] }) {
  return (layout ?? []).map((block, index) => blockFor(block, block.id ?? String(index)))
}
