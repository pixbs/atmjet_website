import { PrivilegeCard } from '@/components/cards/privilege-card'
import { DiamondGold, Exchange, PlaneGold } from '@/components/icons'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/cn'
import { getSocialLinks } from '@/lib/data/site-settings'
import type { ImageSource } from '@/lib/media'

/**
 * The privileges section (issue #120, `docs/legacy-inventory.md` section 5): the heading
 * staying beside a stack of privileges, and under them the gold-edged panel inviting a visitor
 * to write to the company.
 *
 * Where the two buttons lead is the site's, not the section's, so it comes from the settings
 * the header and the footer already read (issue #61).
 */

/** The three the legacy section drew, by the name the block stores. */
const ICONS = { plane: PlaneGold, exchange: Exchange, diamond: DiamondGold }

/** The gold gradient, painted through the letters. */
const HEADING = 'bg-gold bg-clip-text font-serif text-transparent'

export interface PrivilegeProps {
  title: string
  goldTitle: string
  cards: { icon: keyof typeof ICONS; title: string; description: string }[]
  contact: {
    title: string
    description: string
    telegram: string
    whatsapp: string
    background?: ImageSource
  }
}

export async function Privilege({ title, goldTitle, cards, contact }: PrivilegeProps) {
  const social = await getSocialLinks()

  return (
    <section className="bg-graphite-950" data-section="privilege">
      {/* `.container` is an unlayered parity rule, so its `flex-col` beats a plain
          `lg:flex-row` exactly as it did on the legacy site (docs/adr/0006-styling-and-motion.md). */}
      <div className="container gap-10 lg:flex-row!">
        <h2 className="top-40 shrink-0 gap-6 self-start lg:sticky lg:w-72">
          <span className="lg:text-4xl">{title}</span> <br />
          <span className={cn(HEADING, 'font-serif')}>{goldTitle}</span>
        </h2>
        <div className="relative w-full gap-4 self-stretch overflow-clip">
          {/* The clipped box the stack slides inside. */}
          <div className="overflow-clip rounded-2xl" data-cards="privilege">
            {cards.map((card, index) => {
              const Icon = ICONS[card.icon]

              return (
                <PrivilegeCard
                  key={card.title}
                  description={card.description}
                  icon={<Icon className="size-11 shrink-0" />}
                  title={card.title}
                  // Each card stops a little further down than the one above it.
                  top={(index + 1) * 32}
                />
              )
            })}
          </div>
          <div className="overflow-clip rounded-2xl bg-gold p-0.5">
            <div
              className="rounded-2xl bg-graphite-950 bg-fixed lg:flex-row-reverse"
              // The pattern is an upload rather than the legacy's hard-coded file, so it is
              // the address of a document and cannot be a class.
              style={
                contact.background
                  ? { backgroundImage: `url(${contact.background.src})` }
                  : undefined
              }
            >
              <div className="w-full justify-center p-6 md:p-10">
                <h3 className={HEADING}>{contact.title}</h3>
                <p className="pt-4">{contact.description}</p>
                <div className="flex-row flex-wrap gap-4 pt-6">
                  {/* Addresses outside this site, so neither `Link` nor a locale: plain
                      anchors, wearing the button rather than holding one (issue #262). */}
                  <a
                    className={cn(buttonVariants({ as: 'link', size: 'big' }), 'bg-gold')}
                    href={social.telegram}
                  >
                    {contact.telegram}
                  </a>
                  <a
                    className={cn(buttonVariants({ as: 'link', size: 'big' }), 'bg-gold')}
                    href={social.whatsapp}
                  >
                    {contact.whatsapp}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
