import { YachtsCard, type YachtsCardProps } from '@/components/cards/yachts-card'

/**
 * The yachts promotion (issue #121, `docs/legacy-inventory.md` section 5): a heading and a
 * sentence, both centred, over the card that issue #103 ported.
 */
export interface YachtsPromoProps extends Pick<YachtsCardProps, 'image' | 'columns'> {
  title: string
  description?: string
  invitation: YachtsCardProps['invitation']
}

export function YachtsPromo({ title, description, image, columns, invitation }: YachtsPromoProps) {
  return (
    <section data-section="yachts-promo">
      <div className="container">
        <h2 className="mb-4 text-center">{title}</h2>
        <p className="mb-10 text-center">{description}</p>
        <YachtsCard columns={columns} image={image} invitation={invitation} />
      </div>
    </section>
  )
}
