import { mediaSource } from '@/lib/media'
import { hrefForSlug } from '@/lib/nav'
import type { Page } from '@/payload-types'

import { HeroSubpage } from './HeroSubpage/Component'
import { KeyFeatures } from './KeyFeatures/Component'
import { Privilege } from './Privilege/Component'
import { YachtsPromo } from './YachtsPromo/Component'
import { WhyUs } from './WhyUs/Component'

/**
 * The sections of a page, in the order an editor put them (issue #112, E7). One case per block
 * type; a block that cannot draw without its photograph draws nothing rather than a broken one,
 * and one that can — the why us card — simply leaves it out, as the legacy pages did.
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
    case 'keyFeatures': {
      // Every card draws a photograph, so a card without one is left out rather than drawn empty.
      const cards = (block.cards ?? []).flatMap((card) => {
        const image = mediaSource(typeof card.image === 'object' ? card.image : null)

        return image === null ? [] : [{ ...card, description: card.description, image }]
      })

      return cards.length === 0 ? null : (
        <KeyFeatures
          key={key}
          cards={cards}
          description={block.description ?? undefined}
          title={block.title}
        />
      )
    }
    case 'privilege':
      return (
        <Privilege
          key={key}
          cards={(block.cards ?? []).map((card) => ({
            description: card.description,
            icon: card.icon,
            title: card.title,
          }))}
          contact={{
            ...block.contact,
            background:
              mediaSource(
                typeof block.contact.background === 'object' ? block.contact.background : null,
              ) ?? undefined,
          }}
          goldTitle={block.goldTitle}
          title={block.title}
        />
      )
    case 'yachtsPromo': {
      const image = mediaSource(typeof block.image === 'object' ? block.image : null)
      const picture = mediaSource(
        typeof block.invitation.image === 'object' ? block.invitation.image : null,
      )
      // The page arrives as the document, this read being at depth 1; a promotion whose page
      // has been deleted, or is a draft, is not a promotion, so the section is left out.
      const page = typeof block.invitation.page === 'object' ? block.invitation.page : null

      return image === null || picture === null || page === null ? null : (
        <YachtsPromo
          key={key}
          columns={(block.columns ?? []).map((column) => ({
            description: column.description,
            title: column.title,
          }))}
          description={block.description ?? undefined}
          image={image}
          invitation={{
            action: { label: block.invitation.label, href: hrefForSlug(page.slug ?? '') },
            image: picture,
            title: block.invitation.title,
          }}
          title={block.title}
        />
      )
    }
    case 'whyUs':
      return (
        <WhyUs
          key={key}
          cards={(block.cards ?? []).map((card) => ({
            description: card.description,
            figure: card.figure ?? undefined,
            image: mediaSource(typeof card.image === 'object' ? card.image : null) ?? undefined,
            title: card.title,
          }))}
          description={block.description ?? undefined}
          title={block.title}
        />
      )
  }
}

export function RenderBlocks({ layout }: { layout: Page['layout'] }) {
  return (layout ?? []).map((block, index) => blockFor(block, block.id ?? String(index)))
}
