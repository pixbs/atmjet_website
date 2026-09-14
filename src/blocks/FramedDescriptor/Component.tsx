/**
 * The framed descriptor (issue #133, `docs/legacy-inventory.md` section 4): a heading in a box
 * whose gold edge is the half-pixel of gold left showing around a darker box inside it.
 */
export interface FramedDescriptorProps {
  title: string
}

export function FramedDescriptor({ title }: FramedDescriptorProps) {
  return (
    <section data-section="framed-descriptor">
      <div className="container">
        <div className="rounded-xl bg-gold p-0.5">
          <div className="rounded-xl bg-graphite-950 p-10">
            <h2 className="text-center">{title}</h2>
          </div>
        </div>
      </div>
    </section>
  )
}
