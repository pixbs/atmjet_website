/**
 * The group hero (issue #133, `docs/legacy-inventory.md` section 4): the word in its pill, the
 * heading under it and the sentence under that, all down the middle of the page.
 */
export interface HeroGroupProps {
  chip: string
  title: string
  description: string
}

export function HeroGroup({ chip, title, description }: HeroGroupProps) {
  return (
    <section data-section="hero-group">
      <div className="container items-center gap-4 pt-32">
        <p className="rounded-full border border-graphite-800 px-4 py-1 text-sm">{chip}</p>
        <h1 className="pt-2 text-center">{title}</h1>
        <p className="max-w-screen-sm pt-8 text-center">{description}</p>
      </div>
    </section>
  )
}
