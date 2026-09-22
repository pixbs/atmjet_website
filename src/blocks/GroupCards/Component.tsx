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
              {/* The group page opens on this card rather than on a hero, so its photograph is
                  what the page is measured by and is fetched with the markup (issue #176). */}
              <GroupCard {...card} priority={index === 0} />
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}
