import { Logo } from '@/components/icons'

/**
 * The wordmark note (issue #149, `docs/legacy-inventory.md` section 4): the company's mark, a
 * rule, and the sentence beside it — stacked under one another on a phone and laid in a row
 * from `md` up, where the rule turns with them.
 *
 * The legacy passed the mark's height through a misspelt `classname`, so it never arrived and
 * the drawing came out at its natural size (section 13, entry 75); the decision of issue #149
 * is that the intended height is the one it keeps.
 */
export interface WordmarkNoteProps {
  note: string
}

export function WordmarkNote({ note }: WordmarkNoteProps) {
  return (
    <section data-section="wordmark-note">
      <div className="container py-12">
        <div className="card items-center gap-8 p-12 md:flex-row md:gap-12">
          <Logo className="h-12" />
          <div className="h-px w-full shrink-0 bg-graphite-700 md:h-40 md:w-px" />
          <p>{note}</p>
        </div>
      </div>
    </section>
  )
}
