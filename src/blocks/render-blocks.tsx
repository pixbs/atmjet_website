import { mediaSource } from '@/lib/media'
import { hrefForSlug } from '@/lib/nav'
import type { Page } from '@/payload-types'

import { Advantages } from './Advantages/Component'
import { Documents } from './Documents/Component'
import { Faq } from './Faq/Component'
import { GroupCards } from './GroupCards/Component'
import { Guide } from './Guide/Component'
import { HeroSubpage } from './HeroSubpage/Component'
import { KeyFeatures } from './KeyFeatures/Component'
import { OptionsTiles } from './OptionsTiles/Component'
import { Privilege } from './Privilege/Component'
import { Tiles } from './Tiles/Component'
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
    case 'advantages': {
      const image = mediaSource(typeof block.image === 'object' ? block.image : null)

      return image === null ? null : (
        <Advantages
          key={key}
          cards={(block.cards ?? []).map((card) => ({
            description: card.description,
            title: card.title,
          }))}
          image={image}
          title={block.title}
        />
      )
    }
    case 'documents': {
      // A document is its file and its cover; one missing either cannot be offered.
      const offered = (block.documents ?? []).flatMap((entry) => {
        const image = mediaSource(typeof entry.image === 'object' ? entry.image : null)
        const file = mediaSource(typeof entry.file === 'object' ? entry.file : null)
        if (image === null || file === null) return []

        return [{ file: { href: file.src, label: entry.label }, image, title: entry.title }]
      })

      return offered.length === 0 ? null : <Documents key={key} documents={offered} />
    }
    case 'faq':
      return (
        <Faq
          key={key}
          questions={(block.questions ?? []).map((entry) => ({
            answer: entry.answer,
            question: entry.question,
          }))}
          title={block.title}
        />
      )
    case 'groupCards': {
      // A card needs its photograph and somewhere to lead; one without either is left out, and
      // a section of none is left out altogether.
      const cards = (block.cards ?? []).flatMap((card) => {
        const image = mediaSource(typeof card.image === 'object' ? card.image : null)
        const page = typeof card.page === 'object' ? card.page : null
        if (image === null || page === null) return []

        return [
          {
            action: { href: hrefForSlug(page.slug ?? ''), label: card.label },
            description: card.description,
            image,
            title: card.title,
          },
        ]
      })

      return cards.length === 0 ? null : <GroupCards key={key} cards={cards} />
    }
    case 'guide': {
      const image = mediaSource(typeof block.image === 'object' ? block.image : null)

      return image === null ? null : (
        <Guide
          key={key}
          heading={block.heading}
          image={image}
          points={(block.points ?? []).map((point) => point.text)}
          title={block.title}
        />
      )
    }
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
    case 'optionsTiles': {
      // A tile needs both its photograph and somewhere to lead; one without either is left out
      // rather than drawn as a dead square, and a section of none is left out altogether.
      const tiles = (block.tiles ?? []).flatMap((tile) => {
        const image = mediaSource(typeof tile.image === 'object' ? tile.image : null)
        const page = typeof tile.page === 'object' ? tile.page : null
        if (image === null || page === null) return []

        return [
          {
            dim: tile.dim ?? false,
            href: hrefForSlug(page.slug ?? ''),
            image,
            label: tile.label,
            title: tile.title,
          },
        ]
      })

      return tiles.length === 0 ? null : <OptionsTiles key={key} tiles={tiles} />
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
    case 'tiles': {
      // A tile is its photograph; one whose upload is gone leaves a hole in the grid, so it is
      // left out, and a grid of none is left out altogether.
      const photos = (block.tiles ?? []).flatMap((row) => {
        const image = mediaSource(typeof row.image === 'object' ? row.image : null)

        return image === null ? [] : [image]
      })

      return photos.length === 0 ? null : <Tiles key={key} tiles={photos} />
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
