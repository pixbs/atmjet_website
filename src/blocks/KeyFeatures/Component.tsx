import { getTranslations } from 'next-intl/server'

import { KeyFeatureCard } from '@/components/cards/key-feature-card'
import { Carousel, CarouselArrows } from '@/components/ui/carousel'
import type { ImageSource } from '@/lib/media'

/**
 * The key features section (issue #118, `docs/legacy-inventory.md` section 5): the heading in
 * gold beside a carousel of tall photographs, each with its own words over the foot.
 *
 * The cards are server-rendered and handed to the carousel, which is the only client island
 * here (ADR-0007). The legacy arrows were two unnamed buttons; the primitive asks for names, so
 * they come from the page's language rather than from a component (ADR-0003).
 */
export interface KeyFeaturesProps {
  title: string
  description?: string
  cards: { title: string; description: string; image: ImageSource }[]
}

export async function KeyFeatures({ title, description, cards }: KeyFeaturesProps) {
  const t = await getTranslations('common')

  return (
    <section className="overflow-hidden bg-graphite-950" data-section="key-features">
      {/* `.container` is an unlayered parity rule, so its `flex-col` beats a plain `md:flex-row`
          exactly as it did on the legacy site (docs/adr/0006-styling-and-motion.md). */}
      <div className="relative container w-full gap-4 md:flex-row! md:gap-5">
        <div className="relative z-10 gap-4 md:min-w-80">
          <h2 className="bg-gold bg-clip-text text-transparent md:bg-fixed">{title}</h2>
          <p className="mb-8">{description}</p>
        </div>
        <Carousel
          className="w-full"
          controls={
            // The legacy arrows were positioned against the section container, 16px inside its
            // border box; measured from the carousel's own edge that is the container's gutter
            // less those 16px (px-10 at md, px-16 at lg).
            <CarouselArrows
              className="top-4 md:absolute md:right-6 lg:right-12"
              labels={{ previous: t('previous'), next: t('next') }}
            />
          }
          options={{ loop: true }}
        >
          {cards.map((card) => (
            <KeyFeatureCard
              key={card.title}
              description={card.description}
              image={card.image}
              title={card.title}
            />
          ))}
        </Carousel>
      </div>
    </section>
  )
}
