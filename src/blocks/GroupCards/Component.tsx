import { Fragment } from 'react'

import { GroupCard, type GroupCardProps } from '@/components/cards/group-card'

/**
 * The group cards (issue #130, `docs/legacy-inventory.md` section 4): the cards in one clipped
 * box, a rule between each pair, so the corners round the pair rather than each card.
 */
export function GroupCards({ cards }: { cards: GroupCardProps[] }) {
  return (
    <section data-section="group-cards">
      <div className="container">
        <div className="overflow-hidden rounded-2xl" data-cards="group">
          {cards.map((card, index) => (
            // A fragment rather than a wrapper: the rule and the card are siblings inside the
            // clipped box on the legacy site, and a `div` between them would be a flex column.
            <Fragment key={card.title}>
              {index > 0 && <hr />}
              <GroupCard {...card} />
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}
