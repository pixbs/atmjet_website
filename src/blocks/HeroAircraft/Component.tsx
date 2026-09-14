import { Counter } from '@/components/motion/counter'

/**
 * The aircraft hero (issue #133, `docs/legacy-inventory.md` section 4): one heading with the
 * figure counting up inside it, and the sentence under it.
 */
export interface HeroAircraftProps {
  title: string
  figure: string
  title2: string
  description: string
}

export function HeroAircraft({ title, figure, title2, description }: HeroAircraftProps) {
  return (
    <section data-section="hero-aircraft">
      <div className="container gap-20 pt-32">
        <div className="items-center gap-4">
          <h1 className="text-center">
            {title}
            <Counter>{figure}</Counter>
            {title2}
          </h1>
          <p className="text-center md:max-w-screen-sm">{description}</p>
        </div>
      </div>
    </section>
  )
}
