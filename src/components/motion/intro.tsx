'use client'

import { m, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useCallback, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'

import { Words } from '@/components/motion/words'
import { intro, introBackdrop } from '@/lib/motion'

/**
 * Where the intro of the home page is (docs/legacy-inventory.md section 13, entry 101): the
 * preloader moves it on, and the hero reads it to hold back while the curtain is down and to
 * arrive as it opens. `none` is every other moment, the server's included: the hero at rest.
 */
type IntroStage = 'none' | 'covered' | 'opening'

let stage: IntroStage = 'none'
const listeners = new Set<() => void>()

export function setIntroStage(next: IntroStage) {
  if (next === stage) return

  stage = next
  for (const listener of listeners) listener()
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}
const currentStage = () => stage
const atRest = (): IntroStage => 'none'

function useIntroStage() {
  return useSyncExternalStore(subscribe, currentStage, atRest)
}

/**
 * Words that rise into their line as the curtain opens. Plain text until the curtain is down,
 * so the server sends the line whole and it is painted, and timed as the largest paint, before
 * any of this runs; under reduced motion the curtain never comes down and nothing changes.
 */
export function IntroWords({ text, wait = 0 }: { text: string; wait?: number }) {
  const current = useIntroStage()
  const [isSplit, setIsSplit] = useState(false)

  // Split the first time the curtain is down, out of sight, and stay split.
  if (current === 'covered' && !isSplit) setIsSplit(true)

  return isSplit ? <DriftingWords isShown={current !== 'covered'} text={text} wait={wait} /> : text
}

/** The hero's words, drifting ahead of the page and fading as the hero scrolls away. */
function DriftingWords({ text, wait, isShown }: { text: string; wait: number; isShown: boolean }) {
  const section = useRef<HTMLElement | null>(null)
  // The hero's own section, found from the first word before the scroll is measured against it.
  const findSection = useCallback((word: HTMLElement | null) => {
    if (word) section.current = word.closest('section')
  }, [])
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, -intro.drift])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <Words
      firstWord={findSection}
      isShown={isShown}
      style={{ y, opacity }}
      text={text}
      wait={wait}
    />
  )
}

/**
 * The hero's picture: held large while the curtain is down and settling as it opens, then
 * lagging behind the page as the hero scrolls away. It slides inside its own frame, so it never
 * spills into the next section, and under reduced motion it stays put.
 */
export function IntroBackdrop({ children }: { children: ReactNode }) {
  const current = useIntroStage()
  const frame = useRef<HTMLDivElement>(null)
  const isCalm = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: frame, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', isCalm ? '0%' : intro.parallax])

  return (
    <div className="absolute inset-0 z-0 overflow-hidden" ref={frame}>
      <m.div
        animate={current === 'covered' ? 'hidden' : 'visible'}
        className="absolute inset-0"
        initial={false}
        style={{ y }}
        variants={introBackdrop}
      >
        {children}
      </m.div>
    </div>
  )
}
