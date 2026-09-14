import { Fragment } from 'react'

import { Accordion, AccordionItem } from '@/components/ui/accordion'

/**
 * The FAQ section (issue #123, `docs/legacy-inventory.md` section 5): the heading in a column
 * of its own and the questions beside it, one answer open at a time.
 *
 * The questions and answers are server-rendered and handed to the accordion, which is the only
 * part that needs a script (ADR-0007). The legacy answers carried their own line breaks, so
 * they are kept rather than collapsed.
 */
export interface FaqProps {
  title: string
  questions: { question: string; answer: string }[]
}

/** Identifies a question within the list; the accordion opens the first one by this name. */
const valueOf = (index: number) => `question-${index}`

export function Faq({ title, questions }: FaqProps) {
  return (
    <section data-section="faq">
      {/* `.container` is an unlayered parity rule, so its `flex-col` beats a plain `lg:flex-row`
          exactly as it did on the legacy site (docs/adr/0006-styling-and-motion.md). */}
      <div className="container lg:flex-row!">
        <h2 className="max-w-10 shrink-0 md:min-w-80">{title}</h2>
        <Accordion className="pt-4" defaultValue={valueOf(0)}>
          {questions.map((entry, index) => (
            <AccordionItem key={entry.question} title={entry.question} value={valueOf(index)}>
              <div className="flex flex-row overflow-hidden">
                <p>
                  {entry.answer.split('\n').map((line, row) => (
                    <Fragment key={line || row}>
                      <span>{line}</span>
                      <br />
                    </Fragment>
                  ))}
                </p>
              </div>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
