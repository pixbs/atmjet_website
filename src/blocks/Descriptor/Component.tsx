/**
 * The descriptor (issue #133, `docs/legacy-inventory.md` section 4): a heading and the sentence
 * under it, with the room the legacy left beneath them before the next section.
 */
export interface DescriptorProps {
  title: string
  description: string
}

export function Descriptor({ title, description }: DescriptorProps) {
  return (
    <section data-section="descriptor">
      <div className="container gap-4 pb-24">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </section>
  )
}
