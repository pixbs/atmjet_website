'use client'

import { AnimatePresence, m } from 'motion/react'
import { createContext, use, useId, useState, type ReactNode } from 'react'

import { cn } from '@/lib/cn'
import { accordionContent } from '@/lib/motion'

/**
 * The question list of the FAQ (`docs/legacy-inventory.md` sections 6 and 5, FaqSection): one
 * answer open at a time, the open question dimmed to 80%, the answer growing from nothing.
 *
 * Only the toggle is client-side. The questions and answers are passed in as children, so a
 * block renders them on the server and this decides which one is showing (ADR-0007).
 *
 * The legacy title was a `<p>` with an `onClick`, so the list could not be reached by keyboard
 * and a screen reader announced nothing. It is a button here, which is the same to the eye and
 * the reason the accessibility tier passes.
 */
interface AccordionState {
  openValue: string | null
  toggle: (value: string) => void
}

const AccordionContext = createContext<AccordionState | null>(null)

function useAccordion(): AccordionState {
  const state = use(AccordionContext)
  if (!state) throw new Error('An AccordionItem has to be rendered inside an Accordion.')

  return state
}

export function Accordion({
  children,
  className,
  /** The item open on arrival; the legacy FAQ opened its first question. */
  defaultValue = null,
}: {
  children: ReactNode
  className?: string
  defaultValue?: string | null
}) {
  const [openValue, setOpenValue] = useState<string | null>(defaultValue)

  const toggle = (value: string) => setOpenValue((current) => (current === value ? null : value))

  return (
    <div className={className}>
      <AccordionContext value={{ openValue, toggle }}>{children}</AccordionContext>
    </div>
  )
}

export function AccordionItem({
  value,
  title,
  children,
  className,
}: {
  /** Identifies the item within its accordion; `Accordion.defaultValue` names one of these. */
  value: string
  title: ReactNode
  children: ReactNode
  className?: string
}) {
  const { openValue, toggle } = useAccordion()
  const contentId = useId()
  const isOpen = openValue === value

  return (
    <div className={cn('gap-6 border-b border-graphite-800 py-6', className)}>
      <m.button
        aria-controls={contentId}
        aria-expanded={isOpen}
        // The legacy question was a `<p>`, so the parity layer's button rule — the pill, the
        // white fill, the padding and the weight — is taken back off; what is left is what it
        // looked like there (issue #106).
        className="cursor-pointer rounded-none bg-transparent p-0 text-left font-serif text-2xl font-normal text-white"
        // The legacy dimmed the open question and left the timing unset, so the library default
        // still applies (docs/adr/0006-styling-and-motion.md).
        animate={{ opacity: isOpen ? 0.8 : 1 }}
        initial={false}
        onClick={() => toggle(value)}
        type="button"
      >
        {title}
      </m.button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <m.div
            animate="visible"
            className="overflow-hidden"
            exit="hidden"
            id={contentId}
            initial="hidden"
            variants={accordionContent}
          >
            {children}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}
