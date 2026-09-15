import type { Locale } from '@/i18n/locales'
import { mediaSource } from '@/lib/media'
import { hrefForSlug } from '@/lib/nav'
import type { Page } from '@/payload-types'

import { Advantages } from './Advantages/Component'
import { BestPrice } from './BestPrice/Component'
import { ContactCard } from './ContactCard/Component'
import { ContactUs } from './ContactUs/Component'
import { Descriptor } from './Descriptor/Component'
import { Documents } from './Documents/Component'
import { EmptyLegs } from './EmptyLegs/Component'
import { Faq } from './Faq/Component'
import { FramedDescriptor } from './FramedDescriptor/Component'
import { GroupCards } from './GroupCards/Component'
import { Guide } from './Guide/Component'
import { HeroAircraft } from './HeroAircraft/Component'
import { HeroEmptyLegs } from './HeroEmptyLegs/Component'
import { HeroGroup } from './HeroGroup/Component'
import { HeroPartners } from './HeroPartners/Component'
import { HeroSales } from './HeroSales/Component'
import { HeroSubpage } from './HeroSubpage/Component'
import { HeroVideo } from './HeroVideo/Component'
import { HeroYachts } from './HeroYachts/Component'
import { KeyFeatures } from './KeyFeatures/Component'
import { MakeBooking } from './MakeBooking/Component'
import { OptionsSelection } from './OptionsSelection/Component'
import { OptionsTiles } from './OptionsTiles/Component'
import { PersonalManager } from './PersonalManager/Component'
import { PhotoDescriptor } from './PhotoDescriptor/Component'
import { Privilege } from './Privilege/Component'
import { Quote } from './Quote/Component'
import { RecentYachts } from './RecentYachts/Component'
import { Tiles } from './Tiles/Component'
import { Transfer } from './Transfer/Component'
import { WeInspect } from './WeInspect/Component'
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

function blockFor(block: LayoutBlock, key: string, locale: Locale) {
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
    case 'bestPrice': {
      const image = mediaSource(typeof block.image === 'object' ? block.image : null)

      return image === null ? null : (
        <BestPrice
          key={key}
          // The query is the whole of the href, so the dialog opens on the page it is read on,
          // which is what the legacy link did (`docs/legacy-inventory.md` section 3.9).
          action={{ href: `?showBooking=${block.cta.source}`, label: block.cta.label }}
          description={block.description}
          image={image}
          title={block.title}
        />
      )
    }
    case 'contactCard': {
      const image = mediaSource(typeof block.image === 'object' ? block.image : null)

      return image === null ? null : (
        <ContactCard
          key={key}
          action={{ href: `?showBooking=${block.cta.source}`, label: block.cta.label }}
          description={block.description}
          image={image}
          title={block.title}
        />
      )
    }
    case 'contactUs':
      return (
        <ContactUs
          key={key}
          hours={block.hours}
          locale={locale}
          source={block.source}
          telegram={block.telegram}
          whatsapp={block.whatsapp}
        />
      )
    case 'descriptor':
      return <Descriptor key={key} description={block.description} title={block.title} />
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
    case 'emptyLegs':
      return (
        <EmptyLegs
          key={key}
          booking={{ href: `?showBooking=${block.cta.source}`, label: block.cta.label }}
          channel={{
            description: block.channel.description,
            label: block.channel.label,
            title: block.channel.title,
          }}
          description={block.description}
          limit={block.limit}
          title={block.title}
        />
      )
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
    case 'framedDescriptor':
      return <FramedDescriptor key={key} title={block.title} />
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
    case 'heroAircraft':
      return (
        <HeroAircraft
          key={key}
          description={block.description}
          figure={block.figure}
          title={block.title}
          title2={block.title2}
        />
      )
    case 'heroEmptyLegs': {
      const image = mediaSource(typeof block.image === 'object' ? block.image : null)

      return image === null ? null : (
        <HeroEmptyLegs
          key={key}
          description={block.description}
          figure={block.figure}
          image={image}
          subtitle={block.subtitle}
          title={block.title}
        />
      )
    }
    case 'heroGroup':
      return (
        <HeroGroup
          key={key}
          chip={block.chip}
          description={block.description}
          title={block.title}
        />
      )
    case 'heroPartners': {
      const image = mediaSource(typeof block.image === 'object' ? block.image : null)

      return image === null ? null : (
        <HeroPartners
          key={key}
          description={block.description}
          figure={block.figure}
          image={image}
          title={block.title}
          title2={block.title2}
        />
      )
    }
    case 'heroSales': {
      const image = mediaSource(typeof block.image === 'object' ? block.image : null)

      return image === null ? null : (
        <HeroSales
          key={key}
          action={{ href: `?showBooking=${block.cta.source}`, label: block.cta.label }}
          description={block.description}
          image={image}
          lines={(block.lines ?? []).map((line) => ({ figure: line.figure, text: line.text }))}
          overline={block.overline}
        />
      )
    }
    case 'heroYachts': {
      const image = mediaSource(typeof block.image === 'object' ? block.image : null)
      // No wording, no button: the legacy charter page drew this hero without one.
      const label = block.cta.label ?? ''

      return image === null ? null : (
        <HeroYachts
          key={key}
          action={label === '' ? undefined : { href: `?showBooking=${block.cta.source}`, label }}
          description={block.description}
          description2={block.description2 ?? undefined}
          image={image}
          overline={block.overline}
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
    case 'heroVideo': {
      // The still is optional, as the legacy hero was drawn without one.
      const poster = mediaSource(typeof block.poster === 'object' ? block.poster : null)

      return (
        <HeroVideo
          key={key}
          overline={block.overline}
          poster={poster ?? undefined}
          title={block.title}
          video={block.video}
          videoMobile={block.videoMobile ?? undefined}
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
    case 'makeBooking':
      return <MakeBooking key={key} locale={locale} title={block.title} variant={block.variant} />
    case 'optionsSelection': {
      // A card without its photograph is left out rather than drawn as an empty box, and a
      // section with no card left is left out altogether.
      const cards = (block.cards ?? []).flatMap((card) => {
        const image = mediaSource(typeof card.image === 'object' ? card.image : null)
        if (image === null) return []

        return [
          {
            description: card.description,
            image,
            items: (card.items ?? []).map((item) => item.text),
            title: card.title,
          },
        ]
      })

      return cards.length === 0 ? null : (
        <OptionsSelection key={key} cards={cards} title={block.title} />
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
    case 'personalManager': {
      const image = mediaSource(typeof block.image === 'object' ? block.image : null)

      return image === null ? null : (
        <PersonalManager
          key={key}
          chips={(block.chips ?? []).map((chip) => chip.label)}
          description={block.description}
          image={image}
          title={block.title}
        />
      )
    }
    case 'photoDescriptor': {
      const image = mediaSource(typeof block.image === 'object' ? block.image : null)

      return image === null ? null : (
        <PhotoDescriptor
          key={key}
          description={block.description}
          image={image}
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
    case 'quote':
      return (
        <Quote
          key={key}
          attribution={block.attribution}
          quote={block.quote}
          variant={block.variant}
        />
      )
    case 'recentYachts':
      return <RecentYachts key={key} limit={block.limit} title={block.title} />
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
    case 'transfer': {
      const image = mediaSource(typeof block.image === 'object' ? block.image : null)

      return image === null ? null : (
        <Transfer key={key} image={image} locale={locale} title={block.title} />
      )
    }
    case 'weInspect': {
      // Every card draws a photograph, so one whose upload is gone is left out rather than drawn
      // empty, and a row of none is left out altogether.
      const slides = (block.slides ?? []).flatMap((slide) => {
        const image = mediaSource(typeof slide.image === 'object' ? slide.image : null)

        return image === null ? [] : [{ description: slide.description, image, title: slide.title }]
      })

      return slides.length === 0 ? null : (
        <WeInspect key={key} slides={slides} title={block.title} />
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
          title={block.title ?? undefined}
          variant={block.variant}
        />
      )
  }
}

export function RenderBlocks({ layout, locale }: { layout: Page['layout']; locale: Locale }) {
  return (layout ?? []).map((block, index) => blockFor(block, block.id ?? String(index), locale))
}
