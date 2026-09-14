import { ForbesLogo, Logo } from '@/components/icons'

/**
 * A quotation on a card (issue #132, `docs/legacy-inventory.md` section 4): the wordmark over
 * it, the words themselves against a lighter panel with a rule down their left, and the line
 * saying whose they are under that, painted with the gold gradient.
 */

/** The two the legacy page drew, by the name the block stores. */
const MARKS = { press: ForbesLogo, founder: Logo }

export interface QuoteProps {
  variant: keyof typeof MARKS
  quote: string
  attribution: string
}

export function Quote({ variant, quote, attribution }: QuoteProps) {
  const Mark = MARKS[variant]

  return (
    <section data-section="quote">
      <div className="container">
        <div className="card gap-8 bg-graphite-950 p-8 md:gap-10 md:p-10" data-quote={variant}>
          <Mark className="-mb-6 h-14" />
          <h2 className="rounded-r-2xl border-l-2 border-graphite-500 bg-graphite-850 px-8 py-4 text-3xl md:px-10">
            {quote}
          </h2>
          <p className="border-y border-graphite-700 bg-gold bg-clip-text px-10 py-4 text-center text-transparent md:px-16">
            {attribution}
          </p>
        </div>
      </div>
    </section>
  )
}
