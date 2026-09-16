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
  /** The heading beside the stack; the bare variant has none (issue #145). */
  title?: string
  description?: string
  /** `bare` is the group charters page: the cards in the container, nothing around them. */
  variant?: 'stacked' | 'bare'
  cards: { figure?: string; title?: string; description: string; image?: ImageSource }[]
}

export function WhyUs({ title, description, variant = 'stacked', cards }: WhyUsProps) {
  const stack = cards.map((card, index) => (
    <WhyUsCard
      key={card.title ?? card.description}
      description={card.description}
      image={card.image}
      num={card.figure}
      title={card.title}
      top={(index + 1) * 32}
    />
  ))

  // The cards straight into the container, with no heading and nothing clipping them: the
  // group charters page laid them out that way, so they stick to the page rather than to a box.
  if (variant === 'bare')
    return (
      <section data-section="why-us" data-variant="bare">
        <div className="container">{stack}</div>
      </section>
    )

  return (
    <section data-section="why-us" data-variant="stacked">
      {/* `.container` is an unlayered parity rule, so its `flex-col` beats a plain
          `lg:flex-row` exactly as it did on the legacy site; the marker is how the Navbar
          turns the same row on (docs/adr/0006-styling-and-motion.md). */}
      <div className="container gap-10 lg:flex-row!">
        <div className="top-40 shrink-0 gap-6 self-start lg:sticky lg:w-72">
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <div className="relative w-full self-stretch overflow-clip rounded-2xl" data-cards="why-us">
          {stack}
        </div>
      </div>
    </section>
  )
}
