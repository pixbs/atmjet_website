import { WhyUsCard } from '@/components/cards/why-us-card'
import type { ImageSource } from '@/lib/media'

/**
 * The "why us" stack (issue #116, `docs/legacy-inventory.md` section 5): the heading beside a
 * column of cards, each coming to rest a little lower than the one above it while the page
 * keeps moving.
 *
 * Where each card rests is counted here rather than in the card, because it depends on how many
 * there are; the clipped box around them is what the cards slide inside.
 */
export interface WhyUsProps {
  title: string
  description?: string
  cards: { figure?: string; title: string; description: string; image?: ImageSource }[]
}

export function WhyUs({ title, description, cards }: WhyUsProps) {
  return (
    <section data-section="why-us">
      {/* `.container` is an unlayered parity rule, so its `flex-col` beats a plain
          `lg:flex-row` exactly as it did on the legacy site; the marker is how the Navbar
          turns the same row on (docs/adr/0006-styling-and-motion.md). */}
      <div className="container gap-10 lg:flex-row!">
        <div className="top-40 shrink-0 gap-6 self-start lg:sticky lg:w-72">
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <div className="relative w-full self-stretch overflow-clip rounded-2xl" data-cards="why-us">
          {cards.map((card, index) => (
            <WhyUsCard
              key={card.title}
              description={card.description}
              image={card.image}
              num={card.figure}
              title={card.title}
              top={(index + 1) * 32}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
