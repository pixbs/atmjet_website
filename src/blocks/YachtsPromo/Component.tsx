import { YachtsCard, type YachtsCardProps } from '@/components/cards/yachts-card'
import { Arrive, RiseText } from '@/components/motion/arrive'

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
        <RiseText className="mb-4 text-center">{title}</RiseText>
        <Arrive as="p" className="mb-10 text-center" wait={0.3}>
          {description}
        </Arrive>
        <YachtsCard columns={columns} image={image} invitation={invitation} />
      </div>
    </section>
  )
}
