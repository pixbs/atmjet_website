'use client'

import { m, type MotionStyle } from 'motion/react'
import { Fragment, type Ref } from 'react'

import { intro, riseWord } from '@/lib/motion'

/**
 * A line of text as words, each rising into its line from under it, one after the other. Only
 * drawn in the browser once the words are out of sight: the server's text is never split.
 */
export function Words({
  text,
  wait,
  isShown,
  style,
  firstWord,
  onRisen,
}: {
  text: string
  /** Seconds before the first word rises. */
  wait: number
  isShown: boolean
  /** What every word does on top of rising, such as the hero's drift as it scrolls away. */
  style?: MotionStyle
  firstWord?: Ref<HTMLSpanElement>
  /** Called once the last word is in its line. */
  onRisen?: () => void
}) {
  const words = text.split(' ')

  return words.map((word, index) => (
    <Fragment key={index}>
      {index > 0 && ' '}
      <m.span className="inline-block" ref={index === 0 ? firstWord : undefined} style={style}>
        <m.span
          animate={isShown ? 'visible' : 'hidden'}
          className="inline-block"
          custom={wait + index * intro.delay.word}
          initial="hidden"
          onAnimationComplete={
            index === words.length - 1
              ? (definition) => definition === 'visible' && onRisen?.()
              : undefined
          }
          variants={riseWord}
        >
          {word}
        </m.span>
      </m.span>
    </Fragment>
  ))
}
